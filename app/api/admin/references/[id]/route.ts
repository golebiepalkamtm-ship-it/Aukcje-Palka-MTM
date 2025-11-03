import { getAdminUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/prisma';
import { apiRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Zatwierdź/odrzuć referencję
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację - tylko admin
    const authResult = await getAdminUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const { isApproved } = await request.json();

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'Pole isApproved musi być typu boolean' }, { status: 400 });
    }

    // Sprawdź czy referencja istnieje
    const existingReference = await prisma.reference.findUnique({
      where: { id },
    });

    if (!existingReference) {
      return NextResponse.json({ error: 'Referencja nie została znaleziona' }, { status: 404 });
    }

    // Zaktualizuj status zatwierdzenia
    const updatedReference = await prisma.reference.update({
      where: { id },
      data: { isApproved },
      select: {
        id: true,
        breederName: true,
        isApproved: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: `Referencja została ${isApproved ? 'zatwierdzona' : 'odrzucona'}`,
      reference: updatedReference,
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji referencji:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji referencji' },
      { status: 500 }
    );
  }
}

// DELETE - Usuń referencję
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Sprawdź autoryzację - tylko admin
    const authResult = await getAdminUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    // Sprawdź czy referencja istnieje
    const existingReference = await prisma.reference.findUnique({
      where: { id },
    });

    if (!existingReference) {
      return NextResponse.json({ error: 'Referencja nie została znaleziona' }, { status: 404 });
    }

    // Usuń referencję
    await prisma.reference.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Referencja została usunięta',
    });
  } catch (error) {
    console.error('Błąd podczas usuwania referencji:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania referencji' },
      { status: 500 }
    );
  }
}
