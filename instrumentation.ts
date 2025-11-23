export async function register() {
  // WYŁĄCZONE w build i dev - Sentry powoduje błędy webpack
  // Sentry będzie załadowany tylko w runtime w produkcji
  return {};
}

// Export undefined w development i build
export const onRequestError = undefined;
