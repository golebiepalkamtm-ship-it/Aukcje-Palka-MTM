import AuthFlipCard from '@/components/auth/AuthFlipCard';
import { Suspense } from 'react';

export const metadata = {
  title: 'Zaloguj się | Pałka MTM',
  description: 'Zaloguj się do platformy Pałka MTM - aukcje gołębi pocztowych',
};

export default function LoginPage() {
  return (
    <div className="flex items-start justify-center pt-8 pb-12">
      <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
        <AuthFlipCard initialMode="login" />
      </Suspense>
    </div>
  );
}
