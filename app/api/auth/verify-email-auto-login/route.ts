export const runtime = 'nodejs';
import { handleApiError } from '@/lib/error-handling';
import { getAdminAuth } from '@/lib/firebase-admin';
import { requireDatabase, prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // FIXED: Użyj authRateLimit dla tras weryfikacji (5 prób na 15 minut)
    const rateLimitResponse = authRateLimit(request);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Brak email' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Serwis tymczasowo niedostępny. Spróbuj ponownie później.' },
        { status: 503 }
      );
    }

    // Sprawdź czy baza danych jest skonfigurowana
    try {
      requireDatabase();
    } catch (dbConfigError) {
      console.error('❌ Błąd konfiguracji bazy danych:', dbConfigError);
      return NextResponse.json(
        {
          error: 'Baza danych nie jest skonfigurowana. Skontaktuj się z administratorem.',
        },
        { status: 503 }
      );
    }

    // Znajdź użytkownika w bazie po email
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error('❌ Błąd bazy danych:', dbError);
      // Sprawdź czy błąd dotyczy konfiguracji DATABASE_URL
      if (dbError?.message?.includes('the URL must start with the protocol') || 
          dbError?.message?.includes('DATABASE_URL')) {
        return NextResponse.json(
          {
            error: 'Baza danych nie jest poprawnie skonfigurowana. Skontaktuj się z administratorem.',
          },
          { status: 503 }
        );
      }
      // Jeśli to inny błąd, przekaż go dalej
      throw dbError;
    }

    if (!user || !user.firebaseUid) {
      return NextResponse.json(
        {
          error: 'Użytkownik nie został znaleziony',
        },
        { status: 404 }
      );
    }

    // Sprawdź czy użytkownik istnieje w Firebase
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.getUser(user.firebaseUid);
    } catch {
      return NextResponse.json(
        {
          error: 'Użytkownik nie został znaleziony w Firebase',
        },
        { status: 404 }
      );
    }

    // Sprawdź czy email jest zweryfikowany w Firebase
    if (!firebaseUser.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email nie został zweryfikowany w Firebase',
        },
        { status: 400 }
      );
    }

    // Utwórz custom token dla tego użytkownika
    const customToken = await adminAuth.createCustomToken(user.firebaseUid);

    // Zaktualizuj użytkownika w bazie - ustaw emailVerified, isActive i rolę Poziom 2
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          isActive: true,
          role: 'USER_EMAIL_VERIFIED',
        },
      });
    } catch (dbError: any) {
      console.error('❌ Błąd aktualizacji użytkownika:', dbError);
      // Sprawdź czy błąd dotyczy konfiguracji DATABASE_URL
      if (dbError?.message?.includes('the URL must start with the protocol') || 
          dbError?.message?.includes('DATABASE_URL')) {
        return NextResponse.json(
          {
            error: 'Baza danych nie jest poprawnie skonfigurowana. Skontaktuj się z administratorem.',
          },
          { status: 503 }
        );
      }
      // Jeśli to inny błąd, przekaż go dalej
      throw dbError;
    }

    // FIXED: Dodaj security headers do odpowiedzi
    return addSecurityHeaders(
      NextResponse.json({
        customToken,
        email: user.email,
      })
    );
  } catch (error) {
    return handleApiError(error, request, { endpoint: 'auth/verify-email-auto-login' });
  }
}
