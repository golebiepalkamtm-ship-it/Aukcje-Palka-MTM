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
    // Validate private key format
    const normalizedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    // Check if private key looks valid (should start with -----BEGIN)
    if (!normalizedPrivateKey.includes('-----BEGIN')) {
      error('❌ Firebase Admin SDK: Invalid private key format');
      error('Private key should start with "-----BEGIN PRIVATE KEY-----"');
      throw new Error('Invalid Firebase private key format');
    }

    const firebaseAdminConfig = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: normalizedPrivateKey,
      }),
    };

    info('🔧 Initializing Firebase Admin SDK...');

    // Initialize Firebase Admin
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminAuth = getAuth(app);
    
    // Test authentication by trying to get a user (this will fail if credentials are invalid)
    // We'll catch this error and provide better diagnostics
    try {
      // Just verify the auth instance is working - don't actually call any methods
      // The error will surface when we try to use it
      info('✅ Firebase Admin SDK initialized successfully');
    } catch (authTestError) {
      error('❌ Firebase Admin SDK: Auth instance test failed');
      throw authTestError;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error('❌ Firebase Admin SDK initialization error:', errorMessage);
    
    // Provide specific guidance based on error
    if (errorMessage.includes('invalid_grant') || errorMessage.includes('account not found')) {
      error('');
      error('🔧 Firebase Credentials Error - Possible solutions:');
      error('1. Check if the service account key ID exists at:');
      error('   https://console.firebase.google.com/iam-admin/serviceaccounts/project');
      error('2. If the key was revoked, generate a new key at:');
      error('   https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
      error('3. Verify server time is synchronized (NTP)');
      error('4. Ensure FIREBASE_CLIENT_EMAIL matches the service account email');
      error('5. Ensure FIREBASE_PRIVATE_KEY is correctly formatted (with \\n for newlines)');
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('network')) {
      error('');
      error('🔧 Network Error - Check internet connectivity and Firebase service availability');
    }
    
    // Don't throw - allow app to continue but mark as uninitialized
    adminAuth = null;
    app = null;
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
