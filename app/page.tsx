"use client";

import { HeroSection } from '@/components/home/HeroSection';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Sprawdź czy to link weryfikacyjny z Firebase
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    if (mode && oobCode) {
      // Przekieruj na stronę weryfikacji z zachowaniem wszystkich parametrów
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
      router.push(`/auth/verify-email?${params.toString()}`);
    }
  }, [searchParams, router]);

  return <HeroSection />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Ładowanie...</div></div>}>
      <div className="min-h-[200vh]"> {/* Wydłużenie strony */}
        <HomePageContent />
      </div>
    </Suspense>
  );
}
