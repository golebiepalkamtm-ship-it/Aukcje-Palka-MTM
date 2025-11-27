'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { useState, type ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  // ReactQueryDevtools wyłączone z powodu problemów z HMR w Turbopack
  // Można włączyć poprzez zmianę NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS=true w .env.local

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Default export dla lepszej kompatybilności z Fast Refresh
export default ClientProviders;
