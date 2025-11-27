import AuthFlipCard from '@/components/auth/AuthFlipCard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Suspense } from 'react';

export const metadata = {
  title: 'Zaloguj się | Pałka MTM',
  description: 'Zaloguj się do platformy Pałka MTM - aukcje gołębi pocztowych',
};

export default function LoginPage() {
  return (
    <UnifiedLayout showNavigation={true} showFooter={true}>
      <div className="flex items-start justify-center pt-32 pb-32 min-h-[120vh]">
        <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
          <AuthFlipCard initialMode="login" />
        </Suspense>
      </div>
    </UnifiedLayout>
  );
}
