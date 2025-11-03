'use client';

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import ClientProviders from '@/components/providers/ClientProviders';
import { auth } from '@/lib/firebase.client';
import { applyActionCode, signInWithCustomToken, checkActionCode } from 'firebase/auth';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setStatus('error');
      setMessage('Brak kodu weryfikacyjnego w linku');
      return;
    }

    // Zapobiegaj wielokrotnemu wykonywaniu
    if (isProcessing) return;

    setIsProcessing(true);

    // Rozpocznij proces weryfikacji
    const verifyEmail = async () => {
      try {
        // Najpierw sprawdź kod weryfikacyjny aby wyciągnąć email
        const actionCodeInfo = await checkActionCode(auth, oobCode);
        const email = actionCodeInfo.data.email;

        if (!email) {
          throw new Error('Nie można wyciągnąć email z kodu weryfikacyjnego');
        }

        // Zweryfikuj email
        await applyActionCode(auth, oobCode);

        // Natychmiast ustaw status sukcesu
        setStatus('success');
        setMessage('✅ Email został pomyślnie zweryfikowany!');

        // Dodaj krótkie opóźnienie aby użytkownik zobaczył komunikat sukcesu
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Wywołaj API endpoint który stworzy custom token dla użytkownika z tym emailem
        const verifyResponse = await fetch('/api/auth/verify-email-auto-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Błąd automatycznego logowania');
        }

        const { customToken } = await verifyResponse.json();

        // Zaloguj użytkownika używając custom token
        const userCredential = await signInWithCustomToken(auth, customToken);
        const user = userCredential.user;

        // Odśwież token i zsynchronizuj z bazą
        await user.reload();
        const token = await user.getIdToken(true);

        // Zsynchronizuj użytkownika z bazą danych
        const syncResponse = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!syncResponse.ok) {
          const syncError = await syncResponse.json();
          console.error('Błąd synchronizacji po weryfikacji:', syncError);
        }

        // Zapisz token w cookie
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
        // UX cookie: poziom 2 odblokowany
        document.cookie = `level2-ok=1; path=/; max-age=86400; SameSite=Lax`;

        // Przekieruj do /profile/edit zgodnie z wymaganiami
        setTimeout(() => {
          router.push('/profile/edit?verification=success');
        }, 1500);

      } catch (error: any) {
        console.error('Verification error:', error);

        // Sprawdź czy to błąd związany z kodem weryfikacyjnym
        if (error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code') {
          setStatus('error');
          if (error.code === 'auth/invalid-action-code') {
            setMessage('❌ Link weryfikacyjny jest nieprawidłowy lub wygasł');
          } else if (error.code === 'auth/expired-action-code') {
            setMessage('❌ Link weryfikacyjny wygasł. Wyślij nowy email weryfikacyjny');
          }
        } else {
          // To błąd automatycznego logowania - email został zweryfikowany, ale logowanie się nie powiodło
          // Nie zmieniaj statusu na error, zachowaj success ale zmień komunikat
          setMessage('✅ Email został zweryfikowany. Zaloguj się aby kontynuować.');
          setTimeout(() => {
            router.push('/auth/register?verified=true&emailVerified=true');
          }, 3000);
        }
      }
    };

    verifyEmail();
  }, [searchParams, router, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
      >
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Weryfikacja emaila...</h2>
              <p className="text-white/70">Proszę czekać</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{message}</h2>
              <p className="text-white/70 mb-6">
                Twoje konto zostało aktywowane. Za chwilę zostaniesz przekierowany do panelu, aby
                dokończyć konfigurację konta.
              </p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 text-sm">
                  Następny krok: uzupełnienie danych profilowych.
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{message}</h2>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-300 text-sm mb-2">
                  💡 <strong>Co możesz zrobić?</strong>
                </p>
                <ol className="text-yellow-300 text-sm list-decimal list-inside space-y-1">
                  <li>Zaloguj się do swojego konta</li>
                  <li>Przejdź do panelu użytkownika</li>
                  <li>Kliknij przycisk &quot;Wyślij ponownie email weryfikacyjny&quot;</li>
                </ol>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-xl transition-all"
                >
                  Przejdź do logowania
                </button>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-3 rounded-xl transition-all"
                >
                  Przejdź do panelu (jeśli jesteś zalogowany)
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <UnifiedLayout>
      <ClientProviders>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/70">Ładowanie...</p>
              </div>
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </ClientProviders>
    </UnifiedLayout>
  );
}
