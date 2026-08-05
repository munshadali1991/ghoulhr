import { useEffect, useRef } from 'react';

const SESSION_EXPIRED_EVENT = 'ghoulhr:session-expired';

/**
 * Schedules automatic logout when the absolute session deadline is reached.
 * Re-checks on tab focus to handle sleeping browsers.
 */
export function useSessionExpiry(sessionExpiresAt, logout) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sessionExpiresAt || typeof logout !== 'function') {
      return undefined;
    }

    const expiresMs = new Date(sessionExpiresAt).getTime();
    if (!Number.isFinite(expiresMs)) {
      return undefined;
    }

    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleLogout = () => {
      clearTimer();
      const remaining = expiresMs - Date.now();
      if (remaining <= 0) {
        logout({ reason: 'expired' });
        return;
      }
      timerRef.current = setTimeout(() => {
        logout({ reason: 'expired' });
      }, remaining);
    };

    scheduleLogout();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        scheduleLogout();
      }
    };

    window.addEventListener('focus', scheduleLogout);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimer();
      window.removeEventListener('focus', scheduleLogout);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sessionExpiresAt, logout]);
}

export { SESSION_EXPIRED_EVENT };
