import { NextRequest, NextResponse } from 'next/server';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/firebase-admin'; // Importujemy getAdminAuth

// Cache dla zapobieżenia race condition - przechowujemy DANE, nie Response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const syncInProgress = new Map<string, Promise<any>>();

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireFirebaseAuth(req);

    // Sprawdź czy autoryzacja się powiodła
    if (authResult instanceof Response) {
      return authResult; // Zwróć błąd autoryzacji
    }

    const user = authResult.decodedToken;

    console.log('🔄 Auth sync API called for user:', user.uid);

    // Sprawdź czy sync już trwa dla tego użytkownika
    const existingSync = syncInProgress.get(user.uid);
    if (existingSync) {
      console.log('⏳ Sync already in progress, waiting...');
      try {
        const cachedData = await existingSync;
        return NextResponse.json(cachedData);
      } catch {
        // Jeśli poprzedni sync się nie powiódł, pozwól na nowy
        syncInProgress.delete(user.uid);
      }
    }

    // Utwórz promise dla tego syncu - zwraca DANE, nie Response
    const syncPromise = (async () => {
      try {
        const body = await req.json().catch(() => ({}));

        const emailVerifiedDate = user.email_verified ? new Date() : null;

        // Najpierw sprawdź czy użytkownik istnieje - preferuj firebaseUid nad email
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { firebaseUid: user.uid }, // Priorytet: firebaseUid
              { email: user.email! },
            ],
          },
          select: {
            id: true,
            isActive: true,
            firebaseUid: true,
            email: true,
          },
        });

        let dbUser;
        if (existingUser) {
          // Jeśli istnieje użytkownik z tym samym firebaseUid - aktualizuj
          if (existingUser.firebaseUid === user.uid) {
            dbUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                email: user.email!, // Zaktualizuj email na wypadek zmiany
                emailVerified: emailVerifiedDate,
                // Aktualizuj isActive: true jeśli email zweryfikowany, w przeciwnym razie zachowaj istniejącą wartość
                isActive: emailVerifiedDate ? true : existingUser.isActive || false,
                // Ustaw rolę na Poziom 2 jeśli email został zweryfikowany
                ...(emailVerifiedDate ? { role: 'USER_EMAIL_VERIFIED' } : {}),
                ...(body.firstName && { firstName: body.firstName }),
                ...(body.lastName && { lastName: body.lastName }),
                ...(body.address && { address: body.address }),
                ...(body.city && { city: body.city }),
                ...(body.postalCode && { postalCode: body.postalCode }),
                ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
                updatedAt: new Date(),
              },
            });
          } else if (existingUser.email === user.email && !existingUser.firebaseUid) {
            // Jeśli istnieje użytkownik z tym samym emailem ale bez firebaseUid - zaktualizuj
            dbUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firebaseUid: user.uid,
                emailVerified: emailVerifiedDate,
                isActive: emailVerifiedDate ? true : existingUser.isActive || false,
                ...(emailVerifiedDate ? { role: 'USER_EMAIL_VERIFIED' } : {}),
                ...(body.firstName && { firstName: body.firstName }),
                ...(body.lastName && { lastName: body.lastName }),
                ...(body.address && { address: body.address }),
                ...(body.city && { city: body.city }),
                ...(body.postalCode && { postalCode: body.postalCode }),
                ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
                updatedAt: new Date(),
              },
            });
          } else {
            // Konflikt: istnieje użytkownik z tym samym emailem ale z innym firebaseUid
            // To może się zdarzyć przy OAuth - spróbujmy zaktualizować istniejącego użytkownika
            console.log('⚠️ OAuth conflict detected - updating existing user with new firebaseUid');
            dbUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firebaseUid: user.uid, // Zaktualizuj firebaseUid na nowy z OAuth
                emailVerified: emailVerifiedDate,
                isActive: emailVerifiedDate ? true : existingUser.isActive || false,
                ...(emailVerifiedDate ? { role: 'USER_EMAIL_VERIFIED' } : {}),
                ...(body.firstName && { firstName: body.firstName }),
                ...(body.lastName && { lastName: body.lastName }),
                ...(body.address && { address: body.address }),
                ...(body.city && { city: body.city }),
                ...(body.postalCode && { postalCode: body.postalCode }),
                ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
                updatedAt: new Date(),
              },
            });
          }
        } else {
          // Nie istnieje - utwórz nowego
          dbUser = await prisma.user.create({
            data: {
              firebaseUid: user.uid,
              email: user.email!,
              firstName: body.firstName || '',
              lastName: body.lastName || '',
              address: body.address || '',
              city: body.city || '',
              postalCode: body.postalCode || '',
              phoneNumber: body.phoneNumber || '',
              role: emailVerifiedDate ? 'USER_EMAIL_VERIFIED' : 'USER_REGISTERED',
              isActive: emailVerifiedDate ? true : false, // Aktywny tylko jeśli email zweryfikowany
              isPhoneVerified: false,
              isProfileVerified: false,
              emailVerified: emailVerifiedDate,
            },
          });

          // Jeśli to nowa rejestracja OAuth i email nie jest zweryfikowany, wyślij email weryfikacyjny
          if (!emailVerifiedDate && user.email) {
            const adminAuth = getAdminAuth();
            if (adminAuth) {
              try {
                const actionCodeSettings = {
                  url: `${req.nextUrl.origin}/auth/verify-email`, // Użyj dynamicznego URL
                  handleCodeInApp: false,
                };
                const link = await adminAuth.generateEmailVerificationLink(user.email, actionCodeSettings);
                
                // Tutaj powinna być logika wysyłania emaila z linkiem
                // Na potrzeby tego zadania, zakładamy, że istnieje endpoint do wysyłania emaili
                // lub że zostanie on stworzony.
                // W realnej aplikacji, użyłbyś tutaj usługi do wysyłania emaili (np. SendGrid, Nodemailer)
                console.log(`Generated email verification link for ${user.email}: ${link}`);
                // Wywołaj wewnętrzny API endpoint do wysyłania emaili
                await fetch(`${req.nextUrl.origin}/api/email/send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ to: user.email, subject: 'Zweryfikuj swój email', html: `<p>Kliknij <a href="${link}">tutaj</a> aby zweryfikować swój email.</p>` }),
                });
              } catch (emailSendError) {
                console.error('Błąd generowania/wysyłania emaila weryfikacyjnego po OAuth:', emailSendError);
              }
            }
          }
        }

        console.log('✅ User synced successfully:', dbUser.email);
        return { success: true, user: dbUser };
      } catch (error) {
        console.error('❌ Sync error:', error);
        throw error;
      }
    })();

    syncInProgress.set(user.uid, syncPromise);

    try {
      const data = await syncPromise;
      // Zwróć NOWY Response z danymi
      return NextResponse.json(data);
    } finally {
      // Usuń z cache po 2 sekundach
      setTimeout(() => syncInProgress.delete(user.uid), 2000);
    }
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
