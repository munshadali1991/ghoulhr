import { isStagingRuntime } from '@/shared/utils/tenant';

const STORAGE_KEY = 'ghoulhr_session';

export const APP_NAME = 'peopleAIQ';
export const APP_BRAND_INITIALS = 'pA';

const PRODUCTION_API_PATH = '/ghoulhrms/api/v1';
const STAGING_API_PATH = '/staging/api/v1';

/** Resolve API base URL from current host + staging/production path (call per request). */
export function getApiBaseUrl() {
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

  if (isStagingRuntime()) {
    return `${origin}${STAGING_API_PATH}`;
  }

  return `${origin}${PRODUCTION_API_PATH}`;
}

export const DEFAULT_BOOTSTRAP_KEY = import.meta.env.VITE_BOOTSTRAP_ADMIN_KEY ?? '';
export { STORAGE_KEY };
