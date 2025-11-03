import { createApiRoute } from '@/lib/api-middleware';
import { AppErrors } from '@/lib/error-handling';
// TODO: Jeśli potrzebujesz eventów, użyj logger.info lub debug
import {
  auctionQueries,
  createAuctionFilters,
  createAuctionSorting,
  createPagination,
} from '@/lib/optimized-queries';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { auctionCreateSchema } from '@/lib/validations/schemas';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { NextRequest, NextResponse } from 'next/server';

async function getAuctionsHandler(request: NextRequest) {
  // Pobierz parametry z URL
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const sortByParam = url.searchParams.get('sortBy') || 'newest';

  // Mapowanie parametru sortowania na format obsługiwany przez createAuctionSorting
  const sortByMap: Record<string, string> = {
    newest: 'newest',
    oldest: 'oldest',
    endingSoon: 'ending-soon',
    endingLatest: 'ending-latest',
    priceAsc: 'price-low',
    priceDesc: 'price-high',
    priceLow: 'price-low',
    priceHigh: 'price-high',
    title: 'title',
  };

  const sortBy = sortByMap[sortByParam] || 'newest';

  // Walidacja parametrów
  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
    throw AppErrors.validation('Nieprawidłowe parametry paginacji');
  }

  // Utwórz filtry i sortowanie
  const where = createAuctionFilters({
    category: category || undefined,
    status: status || undefined,
    search: search || undefined,
    isApproved: true,
  });
  const orderBy = createAuctionSorting(sortBy);
  const { skip, take } = createPagination(page, limit);

  // Wykonaj zapytania równolegle
  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      ...auctionQueries.withBasicRelations,
      orderBy,
      skip,
      take,
    }),
    prisma.auction.count({ where }),
  ]);

  return NextResponse.json({
    auctions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
}

async function createAuctionHandler(request: NextRequest) {
  // Sprawdź autoryzację użytkownika
  const authResult = await requireFirebaseAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { decodedToken } = authResult;

  // Pobierz i waliduj dane
  const body = await request.json();
  const validatedData = auctionCreateSchema.parse(body);

  // Użyj transakcji, aby zapewnić spójność danych
  // @ts-ignore - Prisma transaction type inference issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await prisma.$transaction(async (tx: any) => {
    // Oblicz czas zakończenia
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 7);

    // 1. Utwórz aukcję
    const auction = await tx.auction.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        startingPrice: validatedData.startingPrice || 0,
        currentPrice: validatedData.startingPrice || validatedData.buyNowPrice || 0,
        buyNowPrice: validatedData.buyNowPrice,
        reservePrice: validatedData.reservePrice,
        startTime: new Date(validatedData.startTime),
        endTime: endTime,
        sellerId: decodedToken.uid,
        status: 'PENDING',
        isApproved: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        startingPrice: true,
        currentPrice: true,
        buyNowPrice: true,
        reservePrice: true,
        startTime: true,
        endTime: true,
        status: true,
        isApproved: true,
        createdAt: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // 2. Utwórz gołębia jeśli są dane
    if (validatedData.pigeon) {
      await tx.pigeon.create({
        data: {
          name: validatedData.title,
          ringNumber: validatedData.pigeon.ringNumber || `RING-${auction.id}`,
          bloodline: validatedData.pigeon.bloodline || 'Nieznana',
          gender:
            validatedData.pigeon.sex === 'male'
              ? 'Samiec'
              : validatedData.pigeon.sex === 'female'
                ? 'Samica'
                : 'Nieznana',
          birthDate: new Date(),
          color: validatedData.pigeon.featherColor || 'Nieznany',
          weight: 0,
          breeder: 'Nieznany',
          description: validatedData.description,
          images: JSON.stringify(validatedData.images || []),
          videos: JSON.stringify(validatedData.videos || []),
          pedigree: JSON.stringify(validatedData.documents || []),
          achievements: JSON.stringify(validatedData.pigeon.purpose || []),
          auctions: {
            connect: { id: auction.id },
          },
        },
      });
    }

    // 3. Utwórz zasoby aukcji
    const assetsToCreate = [
      ...(validatedData.images || []).map(url => ({
        auctionId: auction.id,
        type: 'IMAGE' as const,
        url,
      })),
      ...(validatedData.videos || []).map(url => ({
        auctionId: auction.id,
        type: 'VIDEO' as const,
        url,
      })),
      ...(validatedData.documents || []).map(url => ({
        auctionId: auction.id,
        type: 'DOCUMENT' as const,
        url,
      })),
    ];

    if (assetsToCreate.length > 0) {
      await tx.auctionAsset.createMany({
        data: assetsToCreate,
      });
    }

    // Log business event
    // TODO: Jeśli potrzebujesz eventów, użyj logger.info lub debug

    return { auction };
  });

  return NextResponse.json({
    success: true,
    data: result,
    message: 'Aukcja została utworzona i oczekuje na zatwierdzenie',
  });
}

export const GET = createApiRoute(getAuctionsHandler, 'read');
export const POST = createApiRoute(createAuctionHandler, 'create');
