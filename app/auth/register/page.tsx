import AuthFlipCard from '@/components/auth/AuthFlipCard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Suspense } from 'react';

export const metadata = {
  title: 'Zarejestruj się | Pałka MTM',
  description: 'Utwórz konto na platformie Pałka MTM - aukcje gołębi pocztowych',
};

export default function RegisterPage() {
  return (
    <UnifiedLayout showNavigation={true} showFooter={true}>
      <div className="flex items-start justify-center pt-8 pb-32 min-h-screen">
        <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
          <AuthFlipCard initialMode="register" />
        </Suspense>
      </div>
    </UnifiedLayout>
  );
}
