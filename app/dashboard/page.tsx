'use client';

import { CompleteProfileCard } from '@/components/dashboard/CompleteProfileCard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { VerifyEmailCard } from '@/components/dashboard/VerifyEmailCard';
import { VerifyPhoneCard } from '@/components/dashboard/VerifyPhoneCard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Definicja typu dla użytkownika z bazy danych, aby uniknąć 'any'
interface DbUser {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phoneNumber?: string;
}

// Helper function to check if profile is complete
function isProfileComplete(dbUser: DbUser | null) {
  if (!dbUser) return false;
  return (
    dbUser.firstName &&
    dbUser.lastName &&
    dbUser.address &&
    dbUser.city &&
    dbUser.postalCode &&
    dbUser.phoneNumber
  );
}

export default function DashboardPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/register');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Ładowanie...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Uproszczona logika - zawsze pokazuj UserDashboard, który sam sprawdzi warunki
  // Wszystkie komponenty weryfikacyjne są teraz obsługiwane wewnątrz UserDashboard lub wcześniej
  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8">
        {!user.emailVerified ? (
          <VerifyEmailCard />
        ) : !isProfileComplete(dbUser) ? (
          <CompleteProfileCard />
        ) : !dbUser?.isPhoneVerified ? (
          <VerifyPhoneCard />
        ) : (
          <UserDashboard />
        )}
      </div>
    </UnifiedLayout>
  );
}
