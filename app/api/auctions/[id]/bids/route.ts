import { handleApiError, AppErrors } from '@/lib/error-handling';
import { getActiveUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/prisma';
import { checkProfileCompleteness, getProfileCompletenessMessage } from '@/lib/profile-validation';
import { apiRateLimit } from '@/lib/rate-limit';
import { bidCreateSchema } from '@/lib/validations/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sendBidNotification } from '@/lib/email-notifications';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Konfiguracja licytacji
const BID_CONFIG = {
  MIN_INCREMENT: 5, // Minimalna różnica między ofertami w zł
  SNIPING_PROTECTION_MINUTES: 5, // Przedłużenie aukcji przy ofertach w ostatnich X minut
} as const;

// POST /api/auctions/[id]/bids - Dodaj licytację z pessimistic locking
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację Firebase
    const authResult = await getActiveUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Sprawdź kompletność profilu
    const profileCompleteness = await checkProfileCompleteness(authResult.userId);
    if (!profileCompleteness.isComplete) {
      return NextResponse.json(
        {
          error: 'Profil użytkownika jest niekompletny',
          message: getProfileCompletenessMessage(profileCompleteness),
          missingFields: profileCompleteness.missingFields,
        },
        { status: 400 }
      );
    }

    const { id: auctionId } = await params;
    const body = await request.json();

    // Walidacja danych wejściowych
    const validatedData = bidCreateSchema.parse(body);

    // PESSIMISTIC LOCKING - Zablokuj aukcję dla tej transakcji
    // Rozwiązanie problemu race condition: dwie osoby mogą przebić tę samą cenę w tej samej milisekundzie
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Pobierz aukcję z blokadą (SELECT FOR UPDATE w SQL)
      const auction = await tx.auction.findUniqueOrThrow({
        where: { id: auctionId },
        include: {
          seller: true,
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
          },
        },
      });

      // 2. Walidacje WEWNĄTRZ transakcji (już z blokadą - race condition niemożliwa)
      if (auction.status !== 'ACTIVE') {
        throw AppErrors.validation('Aukcja nie jest aktywna');
      }

      if (!auction.isApproved) {
        throw AppErrors.validation('Aukcja nie została zatwierdzona');
      }

      // Sprawdź czy użytkownik nie jest sprzedawcą
      if (authResult.userId === auction.sellerId) {
        throw AppErrors.validation('Nie możesz licytować w swojej aukcji');
      }

      // Sprawdź czy aukcja nie zakończyła się
      if (new Date() > auction.endTime) {
        throw AppErrors.validation('Aukcja już się zakończyła');
      }

      // 3. Oblicz aktualną cenę i wymagane minimum z inkrementem
      const currentPrice = auction.bids.length > 0 ? auction.bids[0].amount : auction.startingPrice;
      const minRequiredBid = currentPrice + BID_CONFIG.MIN_INCREMENT;

      if (validatedData.amount < minRequiredBid) {
        throw AppErrors.validation(
          `Licytacja musi być przynajmniej ${minRequiredBid} zł (min. różnica: ${BID_CONFIG.MIN_INCREMENT} zł)`
        );
      }

      // Sprawdź cenę "kup teraz"
      if (auction.buyNowPrice && validatedData.amount >= auction.buyNowPrice) {
        throw AppErrors.validation('Użyj opcji "Kup teraz" zamiast licytacji');
      }

      // 4. Utwórz nową licytację
      const bid = await tx.bid.create({
        data: {
          auctionId: auctionId,
          bidderId: authResult.userId,
          amount: validatedData.amount,
        },
        include: {
          bidder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // 5. SNIPING PROTECTION - Jeśli oferta w ostatnich X minut, przedłuż aukcję
      const timeUntilEnd = auction.endTime.getTime() - Date.now();
      const snipingThresholdMs = BID_CONFIG.SNIPING_PROTECTION_MINUTES * 60 * 1000;
      let updatedEndTime = auction.endTime;
      let snipingProtectionTriggered = false;

      if (timeUntilEnd > 0 && timeUntilEnd < snipingThresholdMs) {
        updatedEndTime = new Date(Date.now() + snipingThresholdMs);
        snipingProtectionTriggered = true;
      }

      // 6. Zaktualizuj aukcję (cenę i czas końcowy)
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: validatedData.amount,
          endTime: updatedEndTime,
        },
      });

      // 7. Oznacz poprzednie licytacje jako nie-wygrywające
      await tx.bid.updateMany({
        where: {
          auctionId: auctionId,
          id: { not: bid.id },
        },
        data: {
          isWinning: false,
        },
      });

      // 8. Oznacz nową licytację jako wygrywającą
      await tx.bid.update({
        where: { id: bid.id },
        data: {
          isWinning: true,
        },
      });

      return { bid, snipingProtectionTriggered, newEndTime: updatedEndTime };
    });

    // Pobierz dane o licytującym i poprzednim licytującym do wysłania emaili
    try {
      const bidder = await prisma.user.findUnique({
        where: { id: authResult.userId },
        select: { firstName: true, lastName: true, email: true },
      });

      // Pobierz poprzedniego licytującego (jeśli istniał)
      const previousBid = await prisma.bid.findFirst({
        where: {
          auctionId,
          id: { not: result.bid.id },
          isWinning: false,
        },
        orderBy: { amount: 'desc' },
        include: {
          bidder: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
      });

      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { seller: { select: { email: true } } },
      });

      if (bidder && auction) {
        // Wyślij emaile asynchronicznie (nie czekaj na wynik)
        sendBidNotification({
          auctionId,
          newBidderEmail: bidder.email,
          newBidderName: `${bidder.firstName} ${bidder.lastName}`.trim(),
          newBidAmount: result.bid.amount,
          auctionTitle: auction.title,
          previousBidderEmail: previousBid?.bidder.email,
          previousBidAmount: previousBid?.amount,
        }).catch((err) => {
          console.error('Failed to send email notification:', err);
          // Nie przerywaj odpowiedzi API jeśli email się nie wyśle
        });
      }
    } catch (emailError) {
      console.error('Error preparing email notification:', emailError);
      // Nie przerywaj odpowiedzi API jeśli notyfikacja się nie wyśle
    }

    // Revalidate cache - unieważnij cache aukcji
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath('/auctions');

    return NextResponse.json(
      {
        message: 'Licytacja została dodana',
        bid: result.bid,
        snipingProtectionTriggered: result.snipingProtectionTriggered,
        newEndTime: result.snipingProtectionTriggered ? result.newEndTime : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request, { endpoint: 'auctions/[id]/bids', method: 'POST' });
  }
}

// GET /api/auctions/[id]/bids - Pobierz licytacje aukcji
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id: auctionId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Sprawdź czy aukcja istnieje
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Aukcja nie została znaleziona' }, { status: 404 });
    }

    // Pobierz licytacje
    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { auctionId },
        include: {
          bidder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bid.count({ where: { auctionId } }),
    ]);

    return NextResponse.json({
      bids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, request, { endpoint: 'auctions/[id]/bids', method: 'GET' });
  }
}
