export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { getAdminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Brak tokenu weryfikacji' }, { status: 400 });
    }

    // Weryfikuj token Firebase
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Serwis tymczasowo niedostępny. Spróbuj ponownie później.' },
        { status: 503 }
      );
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      return NextResponse.json({ error: 'Email nie został zweryfikowany' }, { status: 400 });
    }

    // Aktywuj użytkownika w bazie danych - użyj firebaseUid zamiast id
    const user = await prisma.user.findFirst({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie został znaleziony' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Email został zweryfikowany pomyślnie',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (error) {
    console.error('Błąd weryfikacji email:', error);
    return NextResponse.json({ error: 'Wystąpił błąd podczas weryfikacji email' }, { status: 500 });
  }
}
