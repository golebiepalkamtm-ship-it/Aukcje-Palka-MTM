import * as Sentry from '@sentry/nextjs';

// W development wyłącz Sentry - usuwa webpack warnings
// UWAGA: Sentry.init() jest już wywoływane w instrumentation-client.ts
// Ten plik jest używany tylko jako fallback, jeśli instrumentation-client.ts nie jest dostępny
if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
  // Sprawdź czy Sentry nie został już zainicjalizowany
  if (!(window as any).__SENTRY_INITIALIZED__) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT,
      tracesSampleRate: 1.0,
    });
    (window as any).__SENTRY_INITIALIZED__ = true;
  }
}
