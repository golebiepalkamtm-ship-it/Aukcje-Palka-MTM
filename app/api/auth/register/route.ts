export const runtime = 'nodejs';
// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { getAdminAuth } from '@/lib/firebase-admin';
import { handleApiError } from '@/lib/error-handling';
import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const firebaseApiKey =
  process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

async function firebaseRestSignUp(email: string, password: string) {
  if (!firebaseApiKey) {
    throw new Error('Brak klucza API Firebase – nie można utworzyć użytkownika');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error?.message || 'Firebase signUp failed';
    throw new Error(message);
  }

  return {
    uid: body.localId as string,
    idToken: body.idToken as string,
    emailVerified: Boolean(body.emailVerified),
  };
}

async function firebaseRestDelete(idToken?: string) {
  if (!firebaseApiKey || !idToken) return;
  await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${firebaseApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  }).catch(() => undefined);
}

async function firebaseRestSendVerification(idToken?: string) {
  if (!firebaseApiKey || !idToken) return;
  await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken }),
    }
  ).catch(() => undefined);
}

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
  firstName: z
    .union([z.string().min(2, 'Imię musi mieć minimum 2 znaki'), z.literal('')])
    .optional(),
  lastName: z
    .union([z.string().min(2, 'Nazwisko musi mieć minimum 2 znaki'), z.literal('')])
    .optional(),
  phoneNumber: z
    .union([
      z.string().regex(/^\+48\d{9}$/, 'Nieprawidłowy format numeru telefonu (+48XXXXXXXXX)'),
      z.string().regex(/^\+48\d{8}$/, 'Nieprawidłowy format numeru telefonu (+48XXXXXXXX)'),
      z.literal(''),
    ])
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // FIXED: Użyj authRateLimit dla rejestracji (5 prób na 15 minut)
    const rateLimitResponse = authRateLimit(request);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ [REGISTER] Błąd parsowania request body:', parseError);
      return NextResponse.json(
        { error: 'Nieprawidłowy format danych. Wymagany jest JSON.' },
        { status: 400 }
      );
    }

    // Validate data
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('❌ [REGISTER] Zod validation error:', validationError.issues);
        return NextResponse.json({ error: validationError.issues[0].message }, { status: 400 });
      }
      throw validationError;
    }

    console.log('🔍 [REGISTER] Próba rejestracji dla:', validatedData.email);
    console.log('🔍 [REGISTER] Dane walidacji:', {
      email: validatedData.email,
      hasPassword: !!validatedData.password,
      firstName: validatedData.firstName || 'brak',
      lastName: validatedData.lastName || 'brak',
      phoneNumber: validatedData.phoneNumber || 'brak',
    });

    // Najpierw próbuj utworzyć użytkownika w Firebase - to jest źródło prawdy
    const adminAuth = getAdminAuth();
    let firebaseUser: { uid: string; idToken?: string };

    try {
      console.log('🔥 [REGISTER] Próba utworzenia użytkownika w Firebase...');
      if (adminAuth) {
        const userRecord = await adminAuth.createUser({
          email: validatedData.email,
          password: validatedData.password,
          emailVerified: false,
          disabled: false,
        });
        firebaseUser = { uid: userRecord.uid };
        console.log('✅ [REGISTER] Utworzono nowego użytkownika przez Admin SDK:', userRecord.uid);
      } else {
        const restResult = await firebaseRestSignUp(
          validatedData.email,
          validatedData.password
        );
        firebaseUser = { uid: restResult.uid, idToken: restResult.idToken };
        console.log('✅ [REGISTER] Utworzono nowego użytkownika przez REST:', restResult.uid);
        await firebaseRestSendVerification(restResult.idToken);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (firebaseError: any) {
      console.error('⚠️ [REGISTER] Firebase error:', {
        code: firebaseError?.code,
        message: firebaseError?.message,
        error: firebaseError,
        stack: firebaseError?.stack
      });
      
      // Sprawdź czy to błąd credentials
      if (
        firebaseError?.message?.includes('invalid_grant') ||
        firebaseError?.message?.includes('account not found') ||
        firebaseError?.code === 'auth/invalid-credential'
      ) {
        console.error('❌ [REGISTER] Firebase credentials error - klucz został odwołany lub jest nieprawidłowy');
        return NextResponse.json(
          {
            error: 'Błąd konfiguracji serwera. Skontaktuj się z administratorem.',
            details: 'Firebase credentials są nieprawidłowe lub zostały odwołane.'
          },
          { status: 503 }
        );
      }
      
      // Jeśli użytkownik już istnieje w Firebase, to nie można się zarejestrować
      if (
        firebaseError?.code === 'auth/email-already-exists' ||
        firebaseError?.code === 'auth/email-already-in-use'
      ) {
        console.error('⚠️ [REGISTER] Email już istnieje w Firebase:', validatedData.email);
        return NextResponse.json(
          {
            error: 'Użytkownik z tym emailem już istnieje. Zaloguj się zamiast rejestrować.',
          },
          { status: 400 }
        );
      }
      
      // Loguj wszystkie inne błędy Firebase dla debugowania
      console.error('❌ [REGISTER] Nieoczekiwany błąd Firebase:', {
        code: firebaseError?.code,
        message: firebaseError?.message,
        email: validatedData.email
      });
      
      // Inny błąd Firebase - rzucamy dalej
      throw firebaseError;
    }

    // Email weryfikacyjny zostanie wysłany przez client-side po zalogowaniu użytkownika
    // (Firebase Admin SDK nie ma metody do automatycznego wysyłania email weryfikacyjnego)

    // Sprawdź czy użytkownik już istnieje w bazie
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    let user;
    if (existingUser) {
      // Jeśli istnieje rekord bez firebaseUid - zaktualizuj go
      if (!existingUser.firebaseUid) {
        console.log('🔄 [REGISTER] Aktualizowanie istniejącego rekordu bez firebaseUid');
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firebaseUid: firebaseUser.uid,
            firstName:
              validatedData.firstName && validatedData.firstName.trim() !== ''
                ? validatedData.firstName
                : existingUser.firstName,
            lastName:
              validatedData.lastName && validatedData.lastName.trim() !== ''
                ? validatedData.lastName
                : existingUser.lastName,
            phoneNumber:
              validatedData.phoneNumber && validatedData.phoneNumber.trim() !== ''
                ? validatedData.phoneNumber
                : existingUser.phoneNumber,
            isActive: false,
            emailVerified: null,
          },
        });
        console.log('✅ [REGISTER] Zaktualizowano rekord w bazie');
      } else if (existingUser.firebaseUid === firebaseUser.uid) {
        // Rekord istnieje z tym samym firebaseUid - to nie powinno się zdarzyć bo Firebase zwróciłby błąd
        // Ale dla bezpieczeństwa sprawdzamy
        console.log(
          '⚠️ [REGISTER] Rekord już istnieje z tym samym firebaseUid - to nie powinno się zdarzyć'
        );
        // Nie usuwamy użytkownika z Firebase - może być używany
        return NextResponse.json(
          {
            error: 'Użytkownik z tym emailem już istnieje. Zaloguj się zamiast rejestrować.',
          },
          { status: 400 }
        );
      } else {
        // Rekord istnieje z INNYM firebaseUid - sprawdź czy stary użytkownik istnieje w Firebase
        console.log(
          '🔍 [REGISTER] Rekord z tym emailem ma inny firebaseUid:',
          existingUser.firebaseUid
        );
        console.log('🔍 [REGISTER] Sprawdzam czy stary użytkownik istnieje w Firebase...');

        console.log(
          '🔄 [REGISTER] Aktualizacja rekordu z nowym firebaseUid (bez weryfikacji starego konta)'
        );
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firebaseUid: firebaseUser.uid,
            firstName:
              validatedData.firstName && validatedData.firstName.trim() !== ''
                ? validatedData.firstName
                : existingUser.firstName,
            lastName:
              validatedData.lastName && validatedData.lastName.trim() !== ''
                ? validatedData.lastName
                : existingUser.lastName,
            phoneNumber:
              validatedData.phoneNumber && validatedData.phoneNumber.trim() !== ''
                ? validatedData.phoneNumber
                : existingUser.phoneNumber,
            isActive: false,
            emailVerified: null,
          },
        });
        console.log('✅ [REGISTER] Zaktualizowano rekord w bazie z nowym firebaseUid');
      }
    } else {
      // Sprawdź czy numer telefonu już istnieje (tylko jeśli podany)
      if (validatedData.phoneNumber && validatedData.phoneNumber.trim() !== '') {
        const existingPhone = await prisma.user.findFirst({
          where: { phoneNumber: validatedData.phoneNumber },
        });

        if (existingPhone && existingPhone.firebaseUid) {
          console.log('❌ [REGISTER] Numer telefonu już istnieje:', validatedData.phoneNumber);
          // Usuń użytkownika z Firebase bo nie można go zapisać w bazie
          if (adminAuth) {
            await adminAuth.deleteUser(firebaseUser.uid).catch(err =>
              console.error('Błąd usuwania użytkownika z Firebase:', err)
            );
          } else {
            await firebaseRestDelete(firebaseUser.idToken);
          }
          return NextResponse.json(
            { error: 'Użytkownik z tym numerem telefonu już istnieje' },
            { status: 400 }
          );
        }
      }

      // Utwórz nowego użytkownika w bazie danych
      console.log('➕ [REGISTER] Tworzenie nowego rekordu w bazie');
      user = await prisma.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: validatedData.email,
          firstName:
            validatedData.firstName && validatedData.firstName.trim() !== ''
              ? validatedData.firstName
              : null,
          lastName:
            validatedData.lastName && validatedData.lastName.trim() !== ''
              ? validatedData.lastName
              : null,
          phoneNumber:
            validatedData.phoneNumber && validatedData.phoneNumber.trim() !== ''
              ? validatedData.phoneNumber
              : null,
          isActive: false,
          role: 'USER_REGISTERED', // Poziom 1 - tylko logowanie
          emailVerified: null,
          isPhoneVerified: false,
          isProfileVerified: false,
        },
      });
      console.log('✅ [REGISTER] Utworzono nowy rekord w bazie');
    }

    // Sprawdź czy user został utworzony
    if (!user) {
      console.error('❌ [REGISTER] User nie został utworzony - to nie powinno się zdarzyć');
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas tworzenia konta użytkownika' },
        { status: 500 }
      );
    }

    // FIXED: Dodaj security headers do odpowiedzi
    return addSecurityHeaders(
      NextResponse.json(
        {
          message: 'Rejestracja zakończona pomyślnie. Sprawdź email w celu weryfikacji.',
          userId: user.id,
        },
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('❌ [REGISTER] Błąd w endpointzie rejestracji:', error);
    if (error instanceof Error) {
      console.error('❌ [REGISTER] Stack trace:', error.stack);
    }
    return handleApiError(error, request, { endpoint: 'register' });
  }
}
