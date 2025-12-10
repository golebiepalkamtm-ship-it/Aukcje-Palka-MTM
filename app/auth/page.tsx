import AuthFlipCard from '@/components/auth/AuthFlipCard';
import { Suspense } from 'react';

export const metadata = {
  title: 'Zaloguj się lub Zarejestruj | Pałka MTM',
  description: 'Flipuj między logowaniem a rejestracją na platformie Pałka MTM',
};

export default function AuthPage() {
  return (
    <div className="flex items-start justify-center pt-48" style={{ minHeight: '3000px' }}>
      <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
        <AuthFlipCard />
      </Suspense>
    </div>
  );
}
