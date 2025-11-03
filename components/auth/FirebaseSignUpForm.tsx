'use client';

import { auth } from '@/lib/firebase.client';
import { sendEmailVerification, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function FirebaseSignUpForm() {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Imię jest wymagane');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Nazwisko jest wymagane');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email jest wymagany');
      return false;
    }
    if (!formData.password) {
      setError('Hasło jest wymagane');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Użyj API endpoint do rejestracji
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: '+48123456789', // Tymczasowy - będzie uzupełnione w dashboard
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas rejestracji');
      }

      // Zaloguj użytkownika automatycznie po rejestracji (użytkownik już został utworzony przez API)
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Aktualizacja profilu użytkownika
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Wysłanie emaila weryfikacyjnego
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(formData.email)}`,
        handleCodeInApp: false,
      });

      setSuccess('Konto zostało utworzone! Sprawdź email w celu aktywacji konta.');

      // Przekierowanie na dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Błąd rejestracji:', error);

      const err = error as { code?: string };
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Ten email jest już używany');
          break;
        case 'auth/invalid-email':
          setError('Nieprawidłowy format email');
          break;
        case 'auth/weak-password':
          setError('Hasło jest zbyt słabe');
          break;
        default:
          setError('Wystąpił błąd podczas rejestracji');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        placeholder="Imię"
        value={formData.firstName}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Nazwisko"
        value={formData.lastName}
        onChange={handleInputChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Hasło"
        value={formData.password}
        onChange={handleInputChange}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Potwierdź hasło"
        value={formData.confirmPassword}
        onChange={handleInputChange}
      />
      {error && (
        <p className="fixed top-5 left-1/2 -translate-x-1/2 bg-white text-red-500 px-5 py-2.5 rounded-md border-2 border-white z-[1000]">
          {error}
        </p>
      )}
      {success && (
        <p className="fixed top-5 left-1/2 -translate-x-1/2 bg-white text-green-500 px-5 py-2.5 rounded-md border-2 border-white z-[1000]">
          {success}
        </p>
      )}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
      </button>
    </form>
  );
}
