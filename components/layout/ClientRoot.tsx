"use client";

import '@/lib/suppress-hydration-warnings';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { usePathname } from 'next/navigation';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <ClientProviders>
      <UnifiedLayout isHomePage={isHomePage}>{children}</UnifiedLayout>
    </ClientProviders>
  );
}
