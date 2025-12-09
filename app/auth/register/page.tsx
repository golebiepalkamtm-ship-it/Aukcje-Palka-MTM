import AuthFlipCard from '@/components/auth/AuthFlipCard';
import { Suspense } from 'react';

export const metadata = {
  title: 'Zarejestruj się | Pąka MTM',
  description: 'Utwórz konto na platformie Pąka MTM - aukcje gołębi pocztowych',
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-start pt-8 min-h-screen">
      <Suspense fallback={<div className="text-white">�adowanie...</div>}>
        <AuthFlipCard initialMode="register" />
      </Suspense>
    </div>
  );
}
