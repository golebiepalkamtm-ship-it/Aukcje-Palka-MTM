import * as Sentry from '@sentry/nextjs';

// W development wyłącz Sentry - usuwa webpack warnings
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    tracesSampleRate: 1.0,
  });
}
