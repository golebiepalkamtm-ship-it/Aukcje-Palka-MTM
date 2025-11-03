// Firebase Admin SDK - tylko dla serwera
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { isDev, debug, info, error } from './logger';

let adminAuth: ReturnType<typeof getAuth> | null = null;
let app: ReturnType<typeof initializeApp> | null = null;

// Sprawdź czy wszystkie wymagane zmienne środowiskowe są ustawione
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const isTest =
  process.env.NODE_ENV === 'test' ||
  process.env.PLAYWRIGHT_TEST === '1' ||
  process.env.SKIP_FIREBASE_ADMIN === '1';

// Check if we're in build time (Next.js build process)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (isDev && !isTest && !isBuildTime) {
  debug('🔧 Firebase Admin SDK initialization check:');
  debug('- FIREBASE_PROJECT_ID:', projectId ? 'SET' : 'NOT SET');
  debug('- FIREBASE_CLIENT_EMAIL:', clientEmail ? 'SET' : 'NOT SET');
  debug('- FIREBASE_PRIVATE_KEY:', privateKey ? 'SET' : 'NOT SET');
}

if (isTest || isBuildTime) {
  // Skip initialization and logging in test/Playwright/build to keep terminal clean
} else if (!projectId || !clientEmail || !privateKey) {
  error('❌ Firebase Admin SDK credentials not configured!');
  error(
    'Required environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
  );
  error('Aplikacja nie będzie działać bez konfiguracji Firebase!');
} else {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId,
        clientEmail,
        // Avoid printing full private key in logs
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    };

    info('🔧 Initializing Firebase Admin SDK...');

    // Initialize Firebase Admin
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminAuth = getAuth(app);
    info('✅ Firebase Admin SDK initialized successfully');
  } catch (err) {
    error('❌ Firebase Admin SDK initialization error:', err instanceof Error ? err.message : err);
  }
}

// Funkcje pomocnicze do bezpiecznego dostępu
export function getAdminAuth() {
  // Return null instead of throwing error - caller should check
  return adminAuth;
}

export function getAdminApp() {
  // Return null instead of throwing error - caller should check
  return app;
}

export { adminAuth, app };
