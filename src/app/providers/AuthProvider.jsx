import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const HANDOFF_BOOTSTRAP_ERROR =
  'Sign-in could not be completed on your organization site. Please return to the login page and try again.';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());
  const [isInitializing, setIsInitializing] = useState(true);
  const [bootstrapError, setBootstrapError] = useState(null);
  const handoffInFlightRef = useRef(false);

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(user);
  const isSuperAdmin = isSuperAdminUser(user);
  const userName = useMemo(() => getUserDisplayName(user), [user]);

  const clearBootstrapError = useCallback(() => {
    setBootstrapError(null);
  }, []);

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

        if (!alreadyConsumed) {
          if (handoffInFlightRef.current) {
            for (let attempt = 0; attempt < 100 && handoffInFlightRef.current; attempt += 1) {
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (sessionStorage.getItem(handoffStorageKey) !== 'done') {
              if (mounted) {
                setBootstrapError(HANDOFF_BOOTSTRAP_ERROR);
                setIsInitializing(false);
              }
              return;
            }
            stripHandoffFromUrl();
          } else {
            handoffInFlightRef.current = true;

            try {
              await consumeHandoffRequest(handoffCode);
              sessionStorage.setItem(handoffStorageKey, 'done');
              stripHandoffFromUrl();
            } catch (handoffError) {
              stripHandoffFromUrl();
              if (mounted) {
                setBootstrapError(
                  handoffError?.message || HANDOFF_BOOTSTRAP_ERROR,
                );
                setSession(null);
                setIsInitializing(false);
              }
              handoffInFlightRef.current = false;
              return;
            } finally {
              handoffInFlightRef.current = false;
            }
          }
        } else {
          stripHandoffFromUrl();
        }
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
      bootstrapError,
      clearBootstrapError,
    }),
    [
      session,
      refreshSession,
      user,
      isAuthenticated,
      isInitializing,
      isSuperAdmin,
      userName,
      logout,
      bootstrapError,
      clearBootstrapError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
