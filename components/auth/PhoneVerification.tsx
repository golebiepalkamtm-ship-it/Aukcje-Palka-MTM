'use client';

import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase.client';
import { PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Phone, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { debug, isDev, error as logError } from '@/lib/logger';

interface PhoneVerificationProps {
  user: {
    phoneNumber?: string | null;
    isPhoneVerified?: boolean;
  };
  onVerificationComplete?: () => void;
}

export function PhoneVerification({ user, onVerificationComplete }: PhoneVerificationProps) {
  const { user: authUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify' | 'success'>(
    user.isPhoneVerified ? 'success' : user.phoneNumber ? 'verify' : 'phone'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Inicjalizacja reCAPTCHA
  useEffect(() => {
    if (step === 'phone' || step === 'verify') {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-phone-container', {
        size: 'invisible',
        callback: () => {
          if (isDev) debug('reCAPTCHA rozwiązana');
        },
        'expired-callback': () => {
          if (isDev) debug('reCAPTCHA wygasła');
          setError('reCAPTCHA wygasła. Spróbuj ponownie.');
        },
      });

      setRecaptchaVerifier(verifier);

      return () => {
        if (verifier) {
          verifier.clear();
        }
      };
    }
  }, [step]);

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      setError('Podaj numer telefonu');
      return;
    }

    if (!recaptchaVerifier) {
      setError('reCAPTCHA nie jest gotowa. Odśwież stronę.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Użyj PhoneAuthProvider do weryfikacji numeru (bez logowania)
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      setVerificationId(verificationId);

      // Zaktualizuj numer telefonu w profilu użytkownika
      if (authUser) {
        try {
          const token = await authUser.getIdToken();
          await fetch('/api/phone/send-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ phoneNumber }),
          });
        } catch (err) {
          logError('Błąd aktualizacji profilu:', err instanceof Error ? err.message : err);
        }
      }

      setStep('verify');
      setSuccess('Kod weryfikacyjny został wysłany na podany numer telefonu');
      setResendSeconds(60);
    } catch (err) {
      logError('Błąd wysyłania SMS:', err instanceof Error ? err.message : err);
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/invalid-phone-number':
          setError('Nieprawidłowy numer telefonu');
          break;
        case 'auth/too-many-requests':
          setError('Zbyt wiele prób. Spróbuj później.');
          break;
        case 'auth/quota-exceeded':
          setError('Przekroczono limit SMS. Spróbuj później.');
          break;
        default:
          setError('Błąd wysyłania SMS. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Podaj 6-cyfrowy kod weryfikacyjny');
      return;
    }

    if (!verificationId) {
      setError('Sesja weryfikacyjna wygasła. Wyślij kod ponownie.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Weryfikuj kod przez Firebase PhoneAuthProvider (statyczna metoda)
      // Jeśli kod jest nieprawidłowy, Firebase rzuci wyjątek
      PhoneAuthProvider.credential(verificationId, verificationCode);

      // Kod został zweryfikowany - zaktualizuj status w bazie danych
      if (authUser) {
        const token = await authUser.getIdToken();
        const response = await fetch('/api/phone/check-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: verificationCode,
            verificationId: verificationId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Błąd aktualizacji statusu weryfikacji');
        }
      }

      setStep('success');
      setSuccess('Numer telefonu został pomyślnie zweryfikowany!');
      setVerificationId(null);
      onVerificationComplete?.();
    } catch (err) {
      logError('Błąd weryfikacji kodu:', err instanceof Error ? err.message : err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/invalid-verification-code') {
        setError('Nieprawidłowy kod weryfikacyjny');
      } else if (firebaseError.code === 'auth/code-expired') {
        setError('Kod wygasł. Wyślij nowy.');
        setVerificationId(null);
        setStep('phone');
      } else {
        setError(err instanceof Error ? err.message : 'Błąd weryfikacji kodu. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!phoneNumber || resendSeconds > 0 || isLoading) return;

    // Utwórz nową instancję reCAPTCHA
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }

    const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-phone-container', {
      size: 'invisible',
    });
    setRecaptchaVerifier(newVerifier);

    await handleSendSMS();
  };

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((s: number) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendSeconds]);

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-white">
              Numer telefonu zweryfikowany
            </h3>
            <p className="text-white/70">
              {user.phoneNumber} - Możesz teraz licytować i dodawać aukcje
            </p>
          </div>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-300 text-sm">
            ✅ Weryfikacja telefonu została zakończona pomyślnie. Masz teraz pełny dostęp do
            wszystkich funkcji platformy.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl border border-white/10 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-white/60" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-white">Weryfikacja numeru telefonu</h3>
          <p className="text-white/70">
            Zweryfikuj swój numer telefonu, aby móc licytować i dodawać aukcje
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Numer telefonu *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+48 XXX XXX XXX"
                className="w-full px-4 py-3 pl-10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/10 text-white placeholder-white/50"
                aria-label="Numer telefonu"
              />
            </div>
            <p className="text-sm text-white/50 mt-1">Format: +48 XXX XXX XXX lub XXX XXX XXX</p>
          </div>

          <button
            onClick={() => handleSendSMS()}
            disabled={isLoading || !phoneNumber}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Wysyłanie...</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                <span>Wyślij kod weryfikacyjny</span>
              </>
            )}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Kod weryfikacyjny *
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/10 text-white placeholder-white/50 text-center text-lg tracking-widest"
              aria-label="Kod weryfikacyjny"
              maxLength={6}
            />
            <p className="text-sm text-white/50 mt-1">
              Wprowadź 6-cyfrowy kod wysłany na numer {phoneNumber}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Weryfikacja...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Zweryfikuj numer</span>
                </>
              )}
            </button>

            <button
              onClick={handleResendCode}
              disabled={isLoading || resendSeconds > 0 || !phoneNumber}
              className="px-4 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Wysyłanie...</span>
                </>
              ) : resendSeconds > 0 ? (
                <>Wyślij ponownie ({resendSeconds}s)</>
              ) : (
                <>Wyślij ponownie</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <h4 className="font-medium text-white mb-2">Dlaczego weryfikacja telefonu?</h4>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Zapewnia bezpieczeństwo transakcji</li>
          <li>• Zapobiega oszustwom w aukcjach</li>
          <li>• Umożliwia kontakt w przypadku problemów</li>
          <li>• Jest wymagana do licytowania i dodawania aukcji</li>
        </ul>
      </div>

      {/* Ukryty kontener dla reCAPTCHA */}
      <div id="recaptcha-phone-container"></div>
    </motion.div>
  );
}
