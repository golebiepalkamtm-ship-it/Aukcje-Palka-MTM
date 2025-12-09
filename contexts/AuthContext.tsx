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
import { debug, info, error as logError, isDev } from '@/lib/logger';
import { AuthUser } from '@/types';

// Użyj wspólnego typu AuthUser z types/index.ts
// Mapowanie z odpowiedzi API do AuthUser
type DbUser = AuthUser & {
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refetchDbUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  error: null,
  signOut: async () => {},
  refetchDbUser: async () => {},
  clearError: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const syncInProgressRef = useRef<string | null>(null);

  const syncUserWithDatabase = useCallback(async (firebaseUser: User) => {
    if (syncInProgressRef.current === firebaseUser.uid) {
      if (isDev) debug('AuthContext: Sync already in progress, skipping...');
      return;
    }

    syncInProgressRef.current = firebaseUser.uid;

    try {
      const token = await firebaseUser.getIdToken(true);

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Obsługa zarówno nowego formatu (ApiResponse) jak i starego (backward compatibility)
        const userData = data.success === true ? data.data.user : data.user;
        const roleUpgraded = data.success === true ? data.data.roleUpgraded : data.roleUpgraded;
        
        // Mapowanie do DbUser (z nullable fields zgodnie z typem)
        setDbUser({
          ...userData,
          address: userData.address || null,
          city: userData.city || null,
          postalCode: userData.postalCode || null,
          phoneNumber: userData.phoneNumber || null,
          emailVerified: userData.emailVerified ? new Date() : null,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
        } as DbUser);
        
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
        
        // Ustaw cookie dla poziomów dostępu na podstawie danych użytkownika
        if (userData.emailVerified) {
          document.cookie = `level2-ok=1; path=/; max-age=86400; SameSite=Lax`;
        }

        if (userData.isPhoneVerified && userData.isProfileVerified && userData.isActive) {
          document.cookie = `level3-ok=1; path=/; max-age=86400; SameSite=Lax`;
        }

        // Ustaw cookie roli użytkownika dla middleware
        if (userData.role) {
          document.cookie = `user-role=${userData.role.toLowerCase()}; path=/; max-age=86400; SameSite=Lax`;
        }
        
        // Wyczyść błąd przy pomyślnej synchronizacji
        setError(null);
        
        if (isDev) info('AuthContext: User synced successfully', { roleUpgraded });
      } else {
        logError('AuthContext: Sync failed:', response.status);
        // Pokaż użytkownikowi komunikat o błędzie synchronizacji
        const errorMessage = response.status === 401 
          ? 'Sesja wygasła. Zaloguj się ponownie.'
          : response.status === 403
          ? 'Brak uprawnień do dostępu.'
          : 'Błąd synchronizacji z serwerem. Spróbuj odświeżyć stronę.';
        setError(errorMessage);
        console.error('❌ ' + errorMessage);
        setDbUser(null);
      }
    } catch (err) {
      logError('AuthContext: Sync error:', err);
      const errorMessage = err instanceof Error && err.message.includes('network')
        ? 'Błąd połączenia z serwerem. Sprawdź połączenie internetowe.'
        : 'Błąd podczas łączenia z kontem. Spróbuj ponownie.';
      setError(errorMessage);
      console.error('❌ ' + errorMessage);
      setDbUser(null);
    } finally {
      setTimeout(() => {
        syncInProgressRef.current = null;
      }, 1000);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetchDbUser = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null); // Wyczyść błąd przed ponowną próbą
      await syncUserWithDatabase(user);
      setLoading(false);
    }
  }, [user, syncUserWithDatabase]);

  useEffect(() => {
    if (!auth) {
      logError('AuthContext: Firebase auth nie jest zainicjalizowany');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);
      setError(null); // Wyczyść błąd przy zmianie stanu autoryzacji
      
      if (firebaseUser) {
        await syncUserWithDatabase(firebaseUser);
      } else {
        setDbUser(null);
        syncInProgressRef.current = null;
        document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'level2-ok=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'level3-ok=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      setLoading(false);
    });

    // Nasłuchuj na custom event "email-verified-complete" - wymuszaj reload Firebase User
    const handleEmailVerified = async () => {
      info('AuthContext: Email verified event - force reload Firebase User');
      if (auth && auth.currentUser) {
        try {
          await auth.currentUser.reload();
          await auth.currentUser.getIdToken(true);
          setUser({ ...auth.currentUser });
          info('AuthContext: Firebase User reloaded, emailVerified:', auth.currentUser.emailVerified);
        } catch (err) {
          logError('AuthContext: Error reloading Firebase User:', err instanceof Error ? err.message : err);
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
      setError(null); // Wyczyść błąd przy wylogowaniu
      // Usuń cookie przy wylogowaniu
      document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'level2-ok=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'level3-ok=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/');
    } catch (err) {
      logError('Error signing out:', err instanceof Error ? err.message : err);
      setError('Błąd podczas wylogowywania.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, error, signOut, refetchDbUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
