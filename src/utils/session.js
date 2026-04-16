import { STORAGE_KEY } from '../config/appConfig';

export function readSession() {
  // First, check if there's a session in URL parameters (from cross-subdomain redirect)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');
    if (sessionParam) {
      try {
        const decodedSession = JSON.parse(atob(sessionParam));
        // Save to localStorage for future use
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decodedSession));
        // Clean up URL by removing the session parameter
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
        return decodedSession;
      } catch (error) {
        console.error('Failed to decode session from URL:', error);
      }
    }
  }

  // Fall back to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
