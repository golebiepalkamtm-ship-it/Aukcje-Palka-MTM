import FirebaseAuthForm from '@/components/auth/FirebaseAuthForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <UnifiedLayout>
      <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
        <FirebaseAuthForm initialMode="signup" />
      </Suspense>
    </UnifiedLayout>
  );
}
