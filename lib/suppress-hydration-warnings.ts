/**
 * Suppresses React hydration warnings in development
 * This module is imported in ClientRoot to reduce console noise
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : String(args[0]);
    
    // Suppress hydration mismatch warnings
    if (
      message.includes('Hydration failed') ||
      message.includes('hydration') ||
      message.includes('Text content does not match') ||
      message.includes('Did not expect server HTML') ||
      message.includes('bis_skin_checked') ||
      message.includes('bis_register') ||
      message.includes('__processed_') ||
      message.includes('attributes of the server rendered HTML') ||
      message.includes('didn\'t match the client properties')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

