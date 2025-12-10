import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';

interface AdminStatus {
  loading: boolean;
  isAdmin: boolean;
  userRole: string | null;
  error: string | null;
}

export function useAdminAuth(): AdminStatus {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    loading: true,
    isAdmin: false,
    userRole: null,
    error: null,
  });

  const checkAdminStatus = useCallback(async () => {
    if (authLoading) return;

    if (!firebaseUser) {
      setAdminStatus({
        loading: false,
        isAdmin: false,
        userRole: null,
        error: 'Użytkownik nie jest zalogowany',
      });
      return;
    }

    setAdminStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = await firebaseUser.getIdToken(true); // Wymuś odświeżenie tokena
      console.log('🔐 [AdminAuth] Pobieranie tokena Firebase - sukces');

      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('🔐 [AdminAuth] Odpowiedź API profile:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        const userRole = data.user?.role || 'USER';
        console.log('🔐 [AdminAuth] Pobrane dane użytkownika:', { role: userRole, email: data.user?.email });

        setAdminStatus({
          loading: false,
          isAdmin: userRole === 'ADMIN',
          userRole,
          error: null,
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Nieznany błąd' }));
        console.error('🔐 [AdminAuth] Błąd API profile:', errorData);
        setAdminStatus({
          loading: false,
          isAdmin: false,
          userRole: null,
          error: errorData.error || 'Nie udało się pobrać danych użytkownika',
        });
      }
    } catch (err) {
      console.error('🔐 [AdminAuth] Wyjątek podczas sprawdzania uprawnień:', err);
      setAdminStatus({
        loading: false,
        isAdmin: false,
        userRole: null,
        error: 'Wystąpił błąd sieci lub serwera',
      });
    }
  }, [firebaseUser, authLoading]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return adminStatus;
}
