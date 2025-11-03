'use client';

import { useAuth } from '@/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';

export function VerifyEmailCard() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    if (!user) return;

    setIsSending(true);
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('Wysłaliśmy nowy link aktywacyjny. Sprawdź swoją skrzynkę (również SPAM).');
    } catch (error) {
      setMessage('Wystąpił błąd podczas wysyłania e-maila. Spróbuj ponownie za chwilę.');
      console.error('Błąd ponownego wysłania email weryfikacyjnego:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mb-6 rounded-xl border-2 border-white bg-white/20 p-6 shadow-[0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-md transition-all duration-300 hover:border-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
          <svg
            className="h-8 w-8 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">📧 Sprawdź swoją pocztę!</h2>
        <p className="mb-4 text-white/70">Wysłaliśmy link aktywacyjny na adres:</p>
        <p className="mb-4 font-medium text-blue-300">{user.email}</p>
        <p className="mb-6 text-sm text-white/60">
          Kliknij w link w e-mailu, aby aktywować konto i uzyskać dostęp do panelu użytkownika.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-green-500/20 px-4 py-2 text-green-300 transition-colors hover:bg-green-500/30"
          >
            Zweryfikowałem e-mail - odśwież
          </button>
          <button
            onClick={handleResendEmail}
            disabled={isSending}
            className="rounded-lg bg-blue-500/20 px-4 py-2 text-blue-300 transition-colors hover:bg-blue-500/30 disabled:opacity-50"
          >
            {isSending ? 'Wysyłanie...' : 'Wyślij ponownie e-mail'}
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-white/80">{message}</p>}
        <p className="mt-4 text-base text-white/60">💡 Wskazówka: Sprawdź także folder SPAM</p>
      </div>
    </div>
  );
}
