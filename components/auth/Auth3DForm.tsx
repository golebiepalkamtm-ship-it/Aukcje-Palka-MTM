import { auth } from '@/lib/firebase.client';
import {
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as logger from '@/lib/logger';

type AuthMode = 'login' | 'register';

interface Auth3DFormProps {
  mode: AuthMode;
  title: string;
  subtitle: string;
  onToggle: () => void;
}

export default function Auth3DForm({ mode, title, subtitle, onToggle }: Auth3DFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Synchronizacja użytkownika
  const syncUser = async (successMessage?: string | null, shouldRedirect: boolean = true) => {
    try {
      if (!auth) throw new Error('Firebase nie jest zainicjalizowany');
      const user = auth.currentUser;
      if (!user) throw new Error('Brak zalogowanego użytkownika');

      const token = await user.getIdToken();
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Synchronizacja nie powiodła się');
      }

      await response.json();
      if (logger.isDev) logger.debug('Synchronizacja udana.');

      if (successMessage !== null && successMessage !== undefined) {
        setSuccess(successMessage);
      }

      // Przekieruj na stronę główną po krótkim opóźnieniu
      if (shouldRedirect) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error) {
      logger.error('Błąd synchronizacji:', error instanceof Error ? error.message : error);
      setError('Wystąpił błąd po zalogowaniu. Spróbuj ponownie.');
      if (auth) await signOut(auth);
    }
  };

  // Logowanie email/hasło
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasErrors = false;

    if (!email.trim()) {
      setFormErrors(prev => ({ ...prev, email: 'Email jest wymagany' }));
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }));
      hasErrors = true;
    }

    if (!password.trim()) {
      setFormErrors(prev => ({ ...prev, password: 'Hasło jest wymagane' }));
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsLoading(true);
    setError('');

    try {
      if (!auth) throw new Error('Firebase nie jest zainicjalizowany');

      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user, {
            url: `${window.location.origin}/auth/verify-email`,
            handleCodeInApp: false,
          });
          setSuccess('⚠️ Twoje konto wymaga weryfikacji emaila. Wysłaliśmy link aktywacyjny.');
        } catch (emailError) {
          logger.error('Błąd wysłania email:', emailError);
          setSuccess('⚠️ Twoje konto wymaga weryfikacji emaila. Sprawdź skrzynkę odbiorczą.');
        }
      }

      await syncUser('✅ Zalogowano pomyślnie! Przekierowywanie na stronę główną...');
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error('Błąd logowania:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          setError('Nie znaleziono konta z tym adresem email');
          break;
        case 'auth/wrong-password':
          setError('Nieprawidłowe hasło');
          break;
        case 'auth/invalid-email':
          setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }));
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut.');
          break;
        default:
          setError('Wystąpił błąd podczas logowania.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Rejestracja email/hasło
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasErrors = false;

    if (!email.trim()) {
      setFormErrors(prev => ({ ...prev, email: 'Email jest wymagany' }));
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormErrors(prev => ({ ...prev, email: 'Nieprawidłowy format email' }));
      hasErrors = true;
    }

    if (!password.trim()) {
      setFormErrors(prev => ({ ...prev, password: 'Hasło jest wymagane' }));
      hasErrors = true;
    } else if (password.length < 8) {
      setFormErrors(prev => ({ ...prev, password: 'Hasło musi mieć co najmniej 8 znaków' }));
      hasErrors = true;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setFormErrors(prev => ({
        ...prev,
        password: 'Hasło musi zawierać małe i wielkie litery oraz cyfry',
      }));
      hasErrors = true;
    }

    if (!confirmPassword.trim()) {
      setFormErrors(prev => ({ ...prev, confirmPassword: 'Potwierdzenie hasła jest wymagane' }));
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setFormErrors(prev => ({ ...prev, confirmPassword: 'Hasła nie są identyczne' }));
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Tylko wymagane pola - firstName i lastName są opcjonalne w API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Wystąpił błąd podczas rejestracji');

      if (!auth) throw new Error('Firebase nie jest zainicjalizowany');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/auth/verify-email`,
          handleCodeInApp: false,
        });
      } catch (emailError) {
        logger.error('Błąd wysłania email:', emailError);
      }

      await syncUser(null, false); // Nie przekierowuj po rejestracji - użytkownik musi zweryfikować email
      setSuccess(`📧 Sprawdź skrzynkę! Link weryfikacyjny wysłany na: ${user.email}. Kliknij link w emailu aby aktywować konto.`);
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error('Błąd rejestracji:', error);

      const errorMessage = error.message || 'Wystąpił błąd podczas rejestracji';
      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        setError('Konto z tym adresem email już istnieje');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logowanie przez Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!auth) throw new Error('Firebase nie jest zainicjalizowany');

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user, {
            url: `${window.location.origin}/auth/verify-email`,
            handleCodeInApp: false,
          });
          setSuccess('✅ Rejestracja przez Google! Link weryfikacyjny wysłany na email.');
        } catch (emailError) {
          logger.error('Błąd wysłania email:', emailError);
          setSuccess('✅ Zalogowano przez Google! Zweryfikuj email aby uzyskać pełny dostęp.');
        }
      }

      await syncUser('✅ Zalogowano pomyślnie przez Google! Przekierowywanie na stronę główną...');
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error('Błąd logowania Google:', error);

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setError('Okno logowania zostało zamknięte');
          break;
        case 'auth/popup-blocked':
          setError('Okno logowania zablokowane przez przeglądarkę');
          break;
        case 'auth/cancelled-popup-request':
          setError('Anulowano logowanie');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('Konto z tym emailem już istnieje z inną metodą logowania');
          break;
        default:
          setError('Wystąpił błąd podczas logowania przez Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-3d-form-content">
      <h2 className="text-xl font-bold text-white mb-1 text-center">{title}</h2>
      <p className="text-xs text-white/70 mb-4 text-center">{subtitle}</p>

      {error && (
        <div className="mb-3 p-2.5 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {success && (
        <motion.div
          // @ts-ignore
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gradient-to-r from-amber-500/30 to-amber-600/20 border-2 border-amber-400/50 rounded-xl shadow-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">📧</span>
            <div>
              <p className="text-amber-100 text-sm font-semibold leading-snug">{success}</p>
              {success.includes('weryfikacyjny') && (
                <p className="text-amber-200/70 text-xs mt-1">Sprawdź też folder SPAM</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Google Sign In */}
      <motion.button
        // @ts-ignore
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-3 flex items-center justify-center shadow-lg hover:shadow-xl"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? 'Logowanie...' : 'Zaloguj się przez Google'}
      </motion.button>

      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-transparent text-white/70">lub</span>
        </div>
      </div>

      {/* Form Email/Hasło */}
      <form onSubmit={mode === 'login' ? handleEmailSignIn : handleEmailSignUp} className="space-y-3">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-white/80 mb-0.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
                if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder="twoj@email.pl"
              className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
              disabled={isLoading}
            />
            {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
          </div>
        </div>

        {/* Hasło */}
        <div>
          <label className="block text-xs font-medium text-white/80 mb-0.5">Hasło</label>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError('');
                if (formErrors.password) setFormErrors(prev => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              className={`w-full pl-9 pr-10 py-2 text-sm bg-white border ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {formErrors.password && <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>}
          </div>
        </div>

        {/* Potwierdzenie hasła - tylko rejestracja */}
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-white/80 mb-0.5">Powtórz hasło</label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  setError('');
                  if (formErrors.confirmPassword)
                    setFormErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                disabled={isLoading}
              />
              {formErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        )}

        {/* Zapamiętaj mnie - tylko logowanie */}
        {mode === 'login' && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="mr-1.5 w-3.5 h-3.5 text-amber-600 bg-white/10 border-white/20 rounded focus:ring-amber-500"
              />
              <span className="text-white/70 text-xs">Zapamiętaj mnie</span>
            </label>
            <Link
              href="/auth/reset-password"
              className="text-amber-400 hover:text-amber-300 transition-colors text-xs"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          // @ts-ignore
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 text-sm bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (mode === 'register' ? 'Rejestracja...' : 'Logowanie...') : mode === 'register' ? 'Zarejestruj się' : 'Zaloguj się'}
        </motion.button>
      </form>

      {/* Toggle Button */}
      <div className="mt-4 text-center">
        <p className="text-white/60 text-xs mb-1.5">
          {mode === 'login' ? 'Nie masz konta?' : 'Masz już konto?'}
        </p>
        <button
          onClick={onToggle}
          className="text-amber-400 hover:text-amber-300 transition-colors text-xs font-semibold"
          type="button"
        >
          {mode === 'login' ? 'Zarejestruj się →' : '← Zaloguj się'}
        </button>
      </div>
    </div>
  );
}
