import { DecodedIdToken } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';
import { debug, info, error, isDev } from './logger';

const firebaseApiKey =
  process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

const FIREBASE_REST_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1';

const decodeBase64 = (value: string) => {
  if (typeof atob === 'function') {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(value, 'base64').toString('utf8');
};

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeBase64(padded);
    return JSON.parse(json);
  } catch (err) {
    error('Błąd dekodowania tokenu Firebase:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function verifyTokenViaRest(token: string): Promise<DecodedIdToken | null> {
  if (!firebaseApiKey) {
    error('Brak klucza API Firebase – nie można zweryfikować tokenu bez Firebase Admin SDK');
    return null;
  }

  try {
    const response = await fetch(`${FIREBASE_REST_ENDPOINT}/accounts:lookup?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      error('Firebase REST lookup error:', errBody?.error?.message || response.statusText);
      return null;
    }

    const data = await response.json();
    const user = Array.isArray(data.users) ? data.users[0] : undefined;
    if (!user) {
      error('Firebase REST lookup nie zwrócił użytkownika');
      return null;
    }

    const payload = decodeJwtPayload(token) ?? {};
    const decoded: Record<string, unknown> = { ...payload };

    decoded.uid = user.localId;
    decoded.user_id = user.localId;
    decoded.email = user.email;
    decoded.email_verified = user.emailVerified ?? payload['email_verified'] ?? false;
    decoded.name = user.displayName ?? payload['name'];
    decoded.picture = user.photoUrl ?? payload['picture'];
    decoded.firebase =
      payload['firebase'] ??
      ({
        identities: (user.providerUserInfo ?? []).reduce(
          (
            acc: Record<string, unknown[]>,
            providerInfo: {
              providerId?: string;
              rawId?: string;
              federatedId?: string;
              uid?: string;
            }
          ) => {
            if (!providerInfo?.providerId) return acc;
            const value = providerInfo.rawId || providerInfo.federatedId || providerInfo.uid;
            if (value) {
              acc[providerInfo.providerId] = [value];
            }
            return acc;
          },
          {} as Record<string, unknown[]>
        ),
        sign_in_provider: user.providerUserInfo?.[0]?.providerId ?? 'password',
      } as Record<string, unknown>);

    return decoded as DecodedIdToken;
  } catch (err) {
    error('Błąd weryfikacji przez Firebase REST:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Weryfikuje Firebase ID token z nagłówka Authorization
 * @param request NextRequest object
 * @returns DecodedIdToken lub null jeśli weryfikacja nie powiodła się
 */
export async function verifyFirebaseToken(request: NextRequest): Promise<DecodedIdToken | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Usuń "Bearer " prefix

    if (!token) {
      return null;
    }

    if (adminAuth) {
      try {
        return await adminAuth.verifyIdToken(token);
      } catch (err) {
        error(
          'Błąd weryfikacji tokenu przez Firebase Admin SDK – próba fallbacku REST:',
          err instanceof Error ? err.message : err
        );
      }
    }

    // Fallback na REST API jeśli Admin SDK jest niedostępne
    return await verifyTokenViaRest(token);
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
