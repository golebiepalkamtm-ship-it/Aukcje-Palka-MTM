'use client';

import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CompleteProfileCard() {
  const router = useRouter();
  const [skipProfile, setSkipProfile] = useState(false);

  const handleLater = () => {
    setSkipProfile(true);
  };

  // Jeśli użytkownik wybrał "Zrob później", pokaż pełny dashboard
  if (skipProfile) {
    return (
      <>
        <div className="mb-6 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 font-medium">
                💡 <strong>Pamiętaj:</strong> Niektóre funkcje mogą być ograniczone do czasu
                uzupełnienia profilu.
              </p>
              <p className="mt-1 text-sm text-white/70">
                Możesz uzupełnić profil w każdej chwili w zakładce &quot;Profil&quot;.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard?tab=profile&edit=true')}
              className="ml-4 whitespace-nowrap rounded-lg bg-yellow-500/20 px-4 py-2 text-yellow-300 transition-colors hover:bg-yellow-500/30"
            >
              Uzupełnij profil
            </button>
          </div>
        </div>
        <UserDashboard />
      </>
    );
  }

  return (
    <div className="mb-6 rounded-xl border-2 border-white bg-white/20 p-6 shadow-[0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-md transition-all duration-300 hover:border-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
          <svg
            className="h-8 w-8 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">📝 Uzupełnij swój profil</h2>
        <p className="mb-6 text-white/70">
          Aby uzyskać dostęp do wszystkich funkcji serwisu, prosimy o uzupełnienie danych adresowych
          w swoim profilu. To pozwoli Ci na pełny udział w aukcjach i dodawanie treści.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.push('/dashboard?tab=profile&edit=true')}
            className="rounded-lg bg-yellow-500/20 px-6 py-3 text-yellow-300 transition-colors hover:bg-yellow-500/30"
          >
            Przejdź do edycji profilu
          </button>
          <button
            onClick={handleLater}
            className="rounded-lg bg-white/10 px-6 py-3 text-white/70 transition-colors hover:bg-white/20"
          >
            Zrob później
          </button>
        </div>
      </div>
    </div>
  );
}
