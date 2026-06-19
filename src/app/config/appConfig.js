const STORAGE_KEY = 'ghoulhr_session';

export const APP_NAME = 'peopleAIQ';
export const APP_BRAND_INITIALS = 'pA';

// Always route through proxy (port 8080) - it handles subdomain-based tenant routing
const getCurrentApiUrl = () => {
  const hostname = window.location.hostname;

  // For subdomain access (buggy.localhost, cronjob.localhost, etc.)
  // Route to proxy on the same subdomain
  if (hostname.includes('.localhost')) {
    const subdomain = hostname.split('.')[0];
    return `http://${subdomain}.localhost:8080`;
  }

  // For production domains (e.g., buggy.ghoulhr.com)
  if (hostname.includes('.') && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const subdomain = parts[0];
      // In production, you might use a different proxy domain
      return `http://${subdomain}.localhost:8080`;
    }
  }

  // Fallback to environment variable or default
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
};

export const API_BASE_URL = getCurrentApiUrl();
export const DEFAULT_BOOTSTRAP_KEY = import.meta.env.VITE_BOOTSTRAP_ADMIN_KEY ?? '';
export { STORAGE_KEY };
