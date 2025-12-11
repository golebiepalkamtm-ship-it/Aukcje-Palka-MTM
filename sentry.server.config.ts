// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// W development wyłącz Sentry całkowicie - usuwa wszystkie webpack warnings
// W development nie potrzebujemy error tracking - tylko w produkcji
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://4464a39340871e6eae0f7a2748506557@o4510277332959232.ingest.de.sentry.io/4510277341151312',

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

  });
} else {
  // W development - wyłącz Sentry (nie potrzebujemy error tracking)
  // To eliminuje wszystkie webpack warnings związane z Prisma/OpenTelemetry instrumentation
  console.log('🔇 Sentry wyłączone w development (redukuje webpack warnings)');
}
