import { STORAGE_KEY } from '@/app/config/appConfig';

/**
 * Legacy: tokens were removed from the client. Strip old storage and URL session params.
 */
export function readSession() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session')) {
      urlParams.delete('session');
      const query = urlParams.toString();
      const newUrl =
        window.location.pathname +
        (query ? `?${query}` : '') +
        window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function stripHandoffFromUrl() {
  if (typeof window === 'undefined') {
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('handoff') && !urlParams.get('session')) {
    return;
  }
  urlParams.delete('handoff');
  if (urlParams.get('session')) {
    urlParams.delete('session');
  }
  const query = urlParams.toString();
  const newUrl =
    window.location.pathname +
    (query ? `?${query}` : '') +
    window.location.hash;
  window.history.replaceState({}, document.title, newUrl);
}

export function persistSession() {
  /* Auth is HttpOnly cookies only; no client token storage */
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
