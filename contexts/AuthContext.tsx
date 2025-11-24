'use client';

import { auth } from '@/lib/firebase.client';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { debug, info, error, isDev } from '@/lib/logger';

// Definicja typu dla użytkownika z bazy danych
interface DbUser {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  role: 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';
  isActive: boolean;
  isPhoneVerified: boolean;
  isProfileVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  signOut: async () => {},
  refetchDbUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const syncInProgressRef = useRef<string | null>(null);

  const fetchAndSyncUser = useCallback(
    async (firebaseUser: User) => {
    // Zabezpieczenie przed wielokrotnym wywołaniem dla tego samego użytkownika
    if (syncInProgressRef.current === firebaseUser.uid) {
      if (isDev) debug('AuthContext: Sync already in progress for user:', firebaseUser.uid);
      return;
    }

    syncInProgressRef.current = firebaseUser.uid;
    if (isDev) debug('AuthContext: Syncing user with database:', firebaseUser.email);

    try {
      // Pobierz token (Firebase user jest już aktualny z onAuthStateChanged)
      const token = await firebaseUser.getIdToken(true);

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDbUser(data.user);
        if (isDev) debug('AuthContext: User synced successfully', data.user);

        // Zapisz token w cookie dla middleware
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      } else {
        error('AuthContext: Sync failed:', response.status, response.statusText);
        setDbUser(null);
      }
    } catch (err) {
      error('AuthContext: Sync error:', err instanceof Error ? err.message : err);
      setDbUser(null);
    } finally {
      // Reset po zakończeniu (z małym opóźnieniem, aby uniknąć race conditions)
      setTimeout(() => {
        if (syncInProgressRef.current === firebaseUser.uid) {
          syncInProgressRef.current = null;
        }
      }, 500);
    }
    },
    [] // Stabilna funkcja - nie ma zewnętrznych zależności
  );

  const refetchDbUser = useCallback(
    async () => {
    if (user) {
      setLoading(true);
      await fetchAndSyncUser(user);
      setLoading(false);
    }
    },
    [user, fetchAndSyncUser] // Stabilne zależności
  );

  useEffect(() => {
    if (!auth) {
      error('AuthContext: Firebase auth nie jest zainicjalizowany');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Bezpośrednio wywołaj synchronizację - unikamy zależności od fetchAndSyncUser
        if (syncInProgressRef.current === firebaseUser.uid) {
          if (isDev) debug('AuthContext: Sync already in progress for user:', firebaseUser.uid);
        } else {
          syncInProgressRef.current = firebaseUser.uid;
          if (isDev) debug('AuthContext: Syncing user with database:', firebaseUser.email);

        try {
            const token = await firebaseUser.getIdToken(true);

            const response = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              setDbUser(data.user);
              if (isDev) debug('AuthContext: User synced successfully', data.user);
          document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
            } else {
              error('AuthContext: Sync failed:', response.status, response.statusText);
              setDbUser(null);
            }
        } catch (err) {
            error('AuthContext: Sync error:', err instanceof Error ? err.message : err);
            setDbUser(null);
          } finally {
            setTimeout(() => {
              if (syncInProgressRef.current === firebaseUser.uid) {
                syncInProgressRef.current = null;
              }
            }, 500);
          }
        }
      } else {
        setDbUser(null);
        syncInProgressRef.current = null;
        document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setLoading(false);
    });

    // Nasłuchuj na custom event "email-verified-complete" - wymuszaj reload Firebase User
    const handleEmailVerified = async () => {
      info('AuthContext: Email verified event - force reload Firebase User');
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          await auth.currentUser.getIdToken(true);
          setUser({ ...auth.currentUser });
          info('AuthContext: Firebase User reloaded, emailVerified:', auth.currentUser.emailVerified);
        } catch (err) {
          error('AuthContext: Error reloading Firebase User:', err instanceof Error ? err.message : err);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'email-verified') {
        handleEmailVerified();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('email-verified-complete', handleEmailVerified);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('email-verified-complete', handleEmailVerified);
    };
  }, []); // Stabilny efekt - uruchamiany tylko raz

  const signOut = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase nie jest zainicjalizowany');
      }
      await firebaseSignOut(auth);
      setUser(null);
      setDbUser(null);
      // Usuń cookie przy wylogowaniu
      document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/');
    } catch (err) {
      error('Error signing out:', err instanceof Error ? err.message : err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signOut, refetchDbUser }}>
      {children}
    </AuthContext.Provider>
  );
}
