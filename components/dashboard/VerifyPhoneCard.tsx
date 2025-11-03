'use client';

import Link from 'next/link';

export function VerifyPhoneCard() {
  return (
    <div className="mb-6 rounded-xl border-2 border-white bg-white/20 p-6 shadow-[0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-md transition-all duration-300 hover:border-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
          <svg
            className="h-8 w-8 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">📱 Zweryfikuj numer telefonu</h2>
        <p className="mb-6 text-white/70">
          Ostatni krok! Zweryfikuj swój numer telefonu, aby uzyskać pełen dostęp do wszystkich
          funkcji serwisu, w tym do wystawiania aukcji i licytowania.
        </p>
        <Link
          href="/auth/verify-phone"
          className="rounded-lg bg-purple-500/20 px-6 py-3 text-purple-300 transition-colors hover:bg-purple-500/30"
        >
          Rozpocznij weryfikację SMS
        </Link>
      </div>
    </div>
  );
}
