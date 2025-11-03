'use client';

import { auth } from '@/lib/firebase.client';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { motion } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // Wszystkie hooki muszą być przed warunkami
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Przekieruj zalogowanego użytkownika natychmiast (ale nie jeśli pokazujemy ekran sukcesu)
  useEffect(() => {
    if (!loading && user && !success) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.replace(redirectTo);
    }
  }, [user, loading, router, searchParams, success]);

  if (loading) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Walidacja
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      setIsSubmitting(false);
      return;
    }

    try {
      // Użyj Firebase Client SDK do rejestracji (zgodnie z dokumentacją Firebase)
      const { createUserWithEmailAndPassword, sendEmailVerification } = await import(
        'firebase/auth'
      );

      // Utwórz użytkownika i automatycznie zaloguj (zgodnie z dokumentacją Firebase)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Ustaw success natychmiast po utworzeniu użytkownika, aby uniknąć race condition
      // z AuthContext, który może ustawić user przed ustawieniem success
      setSuccess(true);

      // Wyślij email weryfikacyjny
      try {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/auth/verify-email`,
          handleCodeInApp: false,
        });
      } catch (emailError) {
        console.error('Błąd wysyłania email weryfikacyjnego:', emailError);
      }

      // Synchronizuj użytkownika z bazą danych przez API
      try {
        const syncResponse = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            email: user.email,
            firstName: '', // Będzie uzupełnione w dashboard
            lastName: '', // Będzie uzupełnione w dashboard
            phoneNumber: '', // Usunięto tymczasowy numer telefonu
          }),
        });

        if (!syncResponse.ok) {
          console.error('Błąd synchronizacji z bazą danych, ale użytkownik został utworzony');
        }
        // Ustaw ciasteczko UX dla Poziomu 1 (zalogowany), Poziom 2 po weryfikacji email
        document.cookie = `level1-ok=1; path=/; max-age=86400; SameSite=Lax`;
      } catch (syncError) {
        console.error('Błąd synchronizacji:', syncError);
        // Kontynuuj nawet jeśli synchronizacja się nie powiodła
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Registration error:', err);

      // Obsługa błędów zgodnie z dokumentacją Firebase
      const firebaseError = err as { code?: string; message?: string };

      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          setError('Ten adres email jest już zarejestrowany. Zaloguj się zamiast rejestrować.');
          break;
        case 'auth/invalid-email':
          setError('Nieprawidłowy format adresu email.');
          break;
        case 'auth/operation-not-allowed':
          setError(
            'Rejestracja przez email/hasło nie jest włączona. Skontaktuj się z administratorem.'
          );
          break;
        case 'auth/weak-password':
          setError('Hasło jest za słabe. Hasło musi mieć co najmniej 6 znaków.');
          break;
        case 'auth/network-request-failed':
          setError('Błąd połączenia sieciowego. Sprawdź połączenie internetowe.');
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele prób. Spróbuj ponownie później.');
          break;
        default:
          setError(firebaseError.message || 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jeśli użytkownik jest zalogowany i nie pokazujemy ekranu sukcesu, nie renderuj nic (nastąpi przekierowanie)
  if (user && !success) {
    return null;
  }

  if (success) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-start justify-center p-4 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Rejestracja udana!
              </h2>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-300 mb-2">
                  Na Twój email ({formData.email}) wysłaliśmy link aktywacyjny.
                </p>
                <p className="text-green-300">
                  Sprawdź też folder <strong>SPAM</strong>.
                </p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  ℹ️ Jesteś już zalogowany i możesz korzystać z platformy. Weryfikacja emaila
                  odblokuje dodatkowe funkcje.
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                Przejdź do panelu
              </button>
              <Link
                href="/auth/register"
                className="block mt-4 text-white/70 hover:text-white text-sm"
              >
                Lub zarejestruj się ponownie
              </Link>
            </div>
          </motion.div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="min-h-screen flex items-start justify-center p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-2">Rejestracja</h2>
          <p className="text-white/70 text-center text-sm mb-8">
            Utwórz konto, aby korzystać z platformy
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Hasło (min. 8 znaków) *"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Potwierdź hasło *"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {isSubmitting ? 'Rejestracja...' : 'Zarejestruj'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Masz już konto?{' '}
              <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold">
                Zaloguj się
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-white font-semibold text-sm mb-2">📋 Proces rejestracji:</h3>
            <ol className="text-white/70 text-xs space-y-1">
              <li>1. Zarejestruj się emailem i hasłem</li>
              <li>2. Zweryfikuj email (kliknij link)</li>
              <li>3. Uzupełnij dane w panelu użytkownika</li>
              <li>4. Zweryfikuj telefon przez SMS</li>
              <li>5. Ciesz się pełnym dostępem!</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Ładowanie...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
