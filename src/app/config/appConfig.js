const STORAGE_KEY = 'ghoulhr_session';

export const APP_NAME = 'peopleAIQ';
export const APP_BRAND_INITIALS = 'pA';

const getCurrentApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const host = window.location.host;

  // For subdomain access (buggy.localhost, cronjob.localhost, etc.)
  // Route to proxy on the same subdomain
  if (hostname.includes('.localhost')) {
    const subdomain = hostname.split('.')[0];
    return `http://${subdomain}.localhost:8080`;
  }

  // For any non-local host, force same-origin API path.
  // This avoids mixed-content by keeping protocol/host aligned with the current page.
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${host}/api/v1`;
  }

  // Fallback to environment variable or default
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
};

export const API_BASE_URL = getCurrentApiUrl();
export const DEFAULT_BOOTSTRAP_KEY = import.meta.env.VITE_BOOTSTRAP_ADMIN_KEY ?? '';
export { STORAGE_KEY };
