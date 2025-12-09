export const isDev = process.env.NODE_ENV !== 'production';

// Flaga do wyłączenia logowania (ustaw na true aby wyciszyć)
const SILENT_MODE = false;

// Simple client-safe logging (no winston dependency for client imports)
export const debug = (...args: any[]) => {
  if (!SILENT_MODE && isDev && typeof window === 'undefined') {
    console.debug('[DEBUG]', ...args);
  }
};

export const info = (...args: any[]) => {
  if (!SILENT_MODE && typeof window === 'undefined') {
    console.info('[INFO]', ...args);
  }
};

export const error = (...args: any[]) => {
  if (!SILENT_MODE && typeof window === 'undefined') {
    console.error('[ERROR]', ...args);
  }
};
