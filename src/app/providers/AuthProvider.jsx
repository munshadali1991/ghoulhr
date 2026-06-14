import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchSessionUser, logoutRequest } from '@/features/auth/api/authApi';
import { clearSession, readSession } from '@/shared/utils/session';
import { getUserDisplayName, isEmployeeTenantUser, isSuperAdminUser } from '@/features/auth/utils/userRoles';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());
  const [isInitializing, setIsInitializing] = useState(true);

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(user);
  const isSuperAdmin = isSuperAdminUser(user);
  const isEmployee = isEmployeeTenantUser(user);
  const userName = useMemo(() => getUserDisplayName(user), [user]);

  useEffect(() => {
    let mounted = true;

    fetchSessionUser()
      .then((userData) => {
        if (mounted && userData) {
          setSession({ user: userData });
        }
      })
      .catch(() => {
        if (mounted) setSession(null);
      })
      .finally(() => {
        if (mounted) setIsInitializing(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      setSession,
      user,
      isAuthenticated,
      isInitializing,
      isSuperAdmin,
      isEmployee,
      userName,
      logout,
    }),
    [session, user, isAuthenticated, isInitializing, isSuperAdmin, isEmployee, userName, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
