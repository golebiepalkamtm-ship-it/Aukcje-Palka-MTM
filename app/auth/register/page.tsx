import AuthFlipCard from '@/components/auth/AuthFlipCard';
import { Suspense } from 'react';

export const metadata = {
  title: 'Zarejestruj się | Pąka MTM',
  description: 'Utwórz konto na platformie Pąka MTM - aukcje gołębi pocztowych',
};

export default function RegisterPage() {
  return (
<<<<<<< HEAD
    <UnifiedLayout showNavigation={true} showFooter={true}>
      <div className="flex flex-col items-center justify-start pt-8 min-h-screen">
        <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
          <AuthFlipCard initialMode="register" />
        </Suspense>
      </div>
    </UnifiedLayout>
=======
    <div className="flex flex-col items-center justify-start pt-8 min-h-screen">
      <Suspense fallback={<div className="text-white">�adowanie...</div>}>
        <AuthFlipCard initialMode="register" />
      </Suspense>
    </div>
>>>>>>> 37190d0b63b671515d651f0bf7fbdd3ff16cc7a9
  );
}
