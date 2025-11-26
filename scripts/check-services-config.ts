/**
 * Skrypt sprawdzający konfigurację wszystkich serwisów
 * Użycie: npx tsx scripts/check-services-config.ts
 */

import { isDatabaseConfigured } from '../lib/prisma';
import { isRedisConfigured, getRedisClient } from '../lib/redis';
import { getAdminAuth, getAdminApp } from '../lib/firebase-admin';
import { isFirebaseConfigValid } from '../lib/firebase-config';

interface ServiceStatus {
  name: string;
  configured: boolean;
  initialized: boolean;
  status: '✅' | '⚠️' | '❌';
  message: string;
  envVars: string[];
}

const services: ServiceStatus[] = [];

// 1. PostgreSQL / Prisma
const dbConfigured = isDatabaseConfigured();
services.push({
  name: 'PostgreSQL / Prisma',
  configured: dbConfigured,
  initialized: dbConfigured,
  status: dbConfigured ? '✅' : '❌',
  message: dbConfigured
    ? 'Baza danych jest skonfigurowana'
    : 'DATABASE_URL nie jest ustawiony',
  envVars: ['DATABASE_URL', 'PROD_DATABASE_URL', 'DEV_DATABASE_URL', 'TEST_DATABASE_URL'],
});

// 2. Firebase Admin SDK
const firebaseAdminAuth = getAdminAuth();
const firebaseAdminApp = getAdminApp();
const firebaseAdminConfigured =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY;
services.push({
  name: 'Firebase Admin SDK',
  configured: firebaseAdminConfigured,
  initialized: !!firebaseAdminAuth && !!firebaseAdminApp,
  status: firebaseAdminConfigured && firebaseAdminAuth ? '✅' : '⚠️',
  message:
    firebaseAdminConfigured && firebaseAdminAuth
      ? 'Firebase Admin SDK jest skonfigurowany i zainicjalizowany'
      : firebaseAdminConfigured
        ? 'Firebase Admin SDK jest skonfigurowany ale nie zainicjalizowany'
        : 'Firebase Admin SDK nie jest skonfigurowany',
  envVars: ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'],
});

// 3. Firebase Client SDK
const firebaseClientConfigured = isFirebaseConfigValid();
services.push({
  name: 'Firebase Client SDK',
  configured: firebaseClientConfigured,
  initialized: firebaseClientConfigured,
  status: firebaseClientConfigured ? '✅' : '❌',
  message: firebaseClientConfigured
    ? 'Firebase Client SDK jest skonfigurowany'
    : 'Brakuje zmiennych NEXT_PUBLIC_FIREBASE_*',
  envVars: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
});

// 4. Redis
const redisConfigured = isRedisConfigured();
services.push({
  name: 'Redis',
  configured: redisConfigured,
  initialized: false, // Sprawdzimy asynchronicznie
  status: redisConfigured ? '✅' : '⚠️',
  message: redisConfigured
    ? 'Redis jest skonfigurowany (opcjonalny)'
    : 'Redis nie jest skonfigurowany (opcjonalny - aplikacja działa bez cache)',
  envVars: ['REDIS_URL'],
});

// 5. Rate Limiting
services.push({
  name: 'Rate Limiting',
  configured: true,
  initialized: true,
  status: '✅',
  message: 'Rate limiting działa (in-memory)',
  envVars: [],
});

// 6. SMS Service
const smsConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
services.push({
  name: 'SMS Service',
  configured: smsConfigured,
  initialized: smsConfigured,
  status: smsConfigured ? '✅' : '⚠️',
  message: smsConfigured
    ? 'SMS Service używa Firebase Phone Auth'
    : 'SMS Service wymaga NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  envVars: ['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
});

// 7. Monitoring
services.push({
  name: 'Monitoring Service',
  configured: true,
  initialized: true,
  status: '✅',
  message: 'Monitoring działa (in-memory)',
  envVars: [],
});

// 8. Sentry
const sentryConfigured = true; // Zawsze skonfigurowany (wyłączony w dev)
services.push({
  name: 'Sentry',
  configured: sentryConfigured,
  initialized: process.env.NODE_ENV === 'production',
  status: process.env.NODE_ENV === 'production' ? '✅' : '⚠️',
  message:
    process.env.NODE_ENV === 'production'
      ? 'Sentry jest włączony w production'
      : 'Sentry jest wyłączony w development',
  envVars: [],
});

// Funkcja sprawdzająca zmienne środowiskowe
function checkEnvVars(envVars: string[]): { set: string[]; missing: string[] } {
  const set: string[] = [];
  const missing: string[] = [];

  for (const envVar of envVars) {
    if (process.env[envVar]) {
      set.push(envVar);
    } else {
      missing.push(envVar);
    }
  }

  return { set, missing };
}

// Główna funkcja
async function checkServices() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🔍 SPRAWDZANIE KONFIGURACJI SERWISÓW                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Sprawdź Redis connection asynchronicznie
  if (redisConfigured) {
    try {
      const redisClient = await getRedisClient();
      const redisService = services.find(s => s.name === 'Redis');
      if (redisService) {
        redisService.initialized = !!redisClient;
        redisService.status = redisClient ? '✅' : '⚠️';
        redisService.message = redisClient
          ? 'Redis jest połączony'
          : 'Redis jest skonfigurowany ale nie można się połączyć';
      }
    } catch (error) {
      const redisService = services.find(s => s.name === 'Redis');
      if (redisService) {
        redisService.initialized = false;
        redisService.status = '⚠️';
        redisService.message = `Błąd połączenia z Redis: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  }

  // Wyświetl status każdego serwisu
  for (const service of services) {
    console.log(`${service.status} ${service.name}`);
    console.log(`   ${service.message}`);
    
    if (service.envVars.length > 0) {
      const { set, missing } = checkEnvVars(service.envVars);
      if (set.length > 0) {
        console.log(`   ✅ Ustawione: ${set.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`   ❌ Brakuje: ${missing.join(', ')}`);
      }
    }
    console.log('');
  }

  // Podsumowanie
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 PODSUMOWANIE                           ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  
  const ok = services.filter(s => s.status === '✅').length;
  const warning = services.filter(s => s.status === '⚠️').length;
  const error = services.filter(s => s.status === '❌').length;
  
  console.log(`║  ✅ Działające:        ${ok} serwisów                        ║`);
  console.log(`║  ⚠️  Ostrzeżenia:      ${warning} serwisów                  ║`);
  console.log(`║  ❌ Błędy:             ${error} serwisów                    ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  
  if (error > 0) {
    console.log('║  🔴 KRYTYCZNE: Sprawdź serwisy z błędami powyżej          ║');
  } else if (warning > 0) {
    console.log('║  🟡 UWAGA: Niektóre serwisy wymagają konfiguracji         ║');
  } else {
    console.log('║  🟢 WSZYSTKO OK: Wszystkie serwisy są skonfigurowane    ║');
  }
  
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Szczegółowe rekomendacje
  if (error > 0 || warning > 0) {
    console.log('📝 REKOMENDACJE:\n');
    
    if (!dbConfigured) {
      console.log('❌ PostgreSQL / Prisma:');
      console.log('   Ustaw DATABASE_URL w pliku .env.local');
      console.log('   Format: postgresql://user:password@host:port/database?sslmode=require\n');
    }
    
    if (!firebaseAdminConfigured) {
      console.log('⚠️  Firebase Admin SDK:');
      console.log('   Ustaw FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n');
    }
    
    if (!firebaseClientConfigured) {
      console.log('❌ Firebase Client SDK:');
      console.log('   Ustaw wszystkie zmienne NEXT_PUBLIC_FIREBASE_*\n');
    }
    
    if (!redisConfigured) {
      console.log('⚠️  Redis (opcjonalny):');
      console.log('   Ustaw REDIS_URL dla lepszej wydajności cache\n');
    }
  }
}

// Uruchom sprawdzenie
checkServices()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Błąd podczas sprawdzania serwisów:', error);
    process.exit(1);
  });

