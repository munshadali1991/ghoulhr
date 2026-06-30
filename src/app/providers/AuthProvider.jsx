import { useCallback, useEffect, useMemo, useState } from 'react';
import { consumeHandoffRequest, fetchSession } from '@/features/auth/api/authApi';
import { clearSession, readSession, stripHandoffFromUrl } from '@/shared/utils/session';
import {
  getUserDisplayName,
  isSuperAdminUser,
} from '@/features/auth/utils/userRoles';
import {
  SESSION_EXPIRED_EVENT,
  useSessionExpiry,
} from '@/features/auth/hooks/useSessionExpiry';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());
  const [isInitializing, setIsInitializing] = useState(true);

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(user);
  const isSuperAdmin = isSuperAdminUser(user);
  const userName = useMemo(() => getUserDisplayName(user), [user]);

  const refreshSession = useCallback(async () => {
    const sessionData = await fetchSession();
    if (sessionData) {
      setSession(sessionData);
    }
    return sessionData;
  }, []);

  const logout = useCallback(async (options = {}) => {
    const { reason } = options;
    const { logoutRequest } = await import('@/features/auth/api/authApi');
    try {
      await logoutRequest();
    } catch {
      /* cookies may already be cleared server-side */
    }
    clearSession();
    setSession(null);
    if (reason === 'expired' && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ghoulhr:session-expired-notice', {
          detail: { message: 'Your session has expired. Please sign in again.' },
        }),
      );
    }
  }, []);

  useSessionExpiry(session?.sessionExpiresAt, logout);

  useEffect(() => {
    const onSessionExpired = () => {
      logout();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [logout]);

  useEffect(() => {
    let mounted = true;
    let handoffStarted = false;

    async function bootstrapSession() {
      const handoffCode =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('handoff')
          : null;

      if (handoffCode) {
        const handoffStorageKey = `ghoulhr_handoff_${handoffCode}`;
        const alreadyConsumed =
          typeof window !== 'undefined' &&
          sessionStorage.getItem(handoffStorageKey) === 'done';

        if (!alreadyConsumed && !handoffStarted) {
          handoffStarted = true;
          try {
            await consumeHandoffRequest(handoffCode);
            sessionStorage.setItem(handoffStorageKey, 'done');
          } catch {
            /* expired or invalid handoff — fall through to fetchSession */
          }
        }
        stripHandoffFromUrl();
      }

      try {
        const sessionData = await fetchSession();
        if (mounted && sessionData) {
          setSession(sessionData);
        }
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      setSession,
      refreshSession,
      user,
      isAuthenticated,
      isInitializing,
      isSuperAdmin,
      userName,
      logout,
    }),
    [session, refreshSession, user, isAuthenticated, isInitializing, isSuperAdmin, userName, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
