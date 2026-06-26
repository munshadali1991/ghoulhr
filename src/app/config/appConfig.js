const STORAGE_KEY = 'ghoulhr_session';

export const APP_NAME = 'peopleAIQ';
export const APP_BRAND_INITIALS = 'pA';

const PRODUCTION_API_PATH = '/ghoulhrms/api/v1';

function getStagingApiPath() {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') {
    return null;
  }
  const basePath = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${basePath}/api/v1`;
}

// Local dev uses the domain proxy on :8080; production nginx serves API on same host.
const getCurrentApiUrl = () => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
  }

  const { hostname, origin } = window.location;
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();

  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.split('.')[0];
    return `http://${subdomain}.localhost:8080`;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return fromEnv ?? 'http://localhost:8080';
  }

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const stagingApiPath = getStagingApiPath();
  if (stagingApiPath) {
    return `${origin}${stagingApiPath}`;
  }

  return `${origin}${PRODUCTION_API_PATH}`;
};

export const API_BASE_URL = getCurrentApiUrl();
export const DEFAULT_BOOTSTRAP_KEY = import.meta.env.VITE_BOOTSTRAP_ADMIN_KEY ?? '';
export { STORAGE_KEY };
