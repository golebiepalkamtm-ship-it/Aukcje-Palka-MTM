import { DecodedIdToken } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';
import { debug, info, error, isDev } from './logger';

/**
 * Weryfikuje Firebase ID token z nagłówka Authorization
 * @param request NextRequest object
 * @returns DecodedIdToken lub null jeśli weryfikacja nie powiodła się
 */
export async function verifyFirebaseToken(request: NextRequest): Promise<DecodedIdToken | null> {
  try {
    // Sprawdź czy Firebase Admin jest skonfigurowany
    if (!adminAuth) {
      // Only log error if not in build time
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
      if (!isBuildTime) {
        error('❌ Firebase Admin SDK not initialized! Token verification failed.');
        error('Skonfiguruj FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      }
      return null;
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Usuń "Bearer " prefix

    if (!token) {
      return null;
    }

    // Weryfikuj token z Firebase
    const decodedToken = await adminAuth.verifyIdToken(token);

    return decodedToken;
  } catch (err) {
    // Don't log during build time - this is expected when generating static pages
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    if (!isBuildTime) {
      error('Błąd weryfikacji Firebase token:', err instanceof Error ? err.message : err);
    }
    return null;
  }
}

/**
 * Middleware do sprawdzania autoryzacji Firebase w API routes
 * @param request NextRequest object
 * @returns NextResponse z błędem lub null jeśli autoryzacja jest OK
 */
export async function requireFirebaseAuth(request: NextRequest) {
  try {
    // Skip logging during build time to avoid noise
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

    if (isDev && !isBuildTime) debug('🔐 requireFirebaseAuth called');
    const decodedToken = await verifyFirebaseToken(request);

    if (!decodedToken) {
      // Don't log during build time - this is expected when generating static pages
      if (!isBuildTime) {
        info('🔐 Firebase token verification failed');
      }
      return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
    }

    if (!isBuildTime) {
      info('🔐 Firebase token verified successfully for user:', decodedToken.uid);
    }
    return { decodedToken };
  } catch (err) {
    // Don't log during build time
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    if (!isBuildTime) {
      error('🔐 Error in requireFirebaseAuth:', err instanceof Error ? err.message : err);
    }
    return NextResponse.json({ error: 'Błąd autoryzacji' }, { status: 401 });
  }
}
