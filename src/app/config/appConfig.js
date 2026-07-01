import { isStagingRuntime } from '@/shared/utils/tenant';

const STORAGE_KEY = 'ghoulhr_session';

export const APP_NAME = 'peopleAIQ';
export const APP_BRAND_INITIALS = 'pA';

const DEFAULT_STAGING_API_PATH = '/staging/api/v1';
const DEFAULT_PRODUCTION_API_PATH = '/ghoulhrms/api/v1';

function normalizeEnvPath(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function resolveApiPath() {
  const envPath = import.meta.env.VITE_API_PATH?.trim();

  if (isStagingRuntime()) {
    if (import.meta.env.MODE === 'staging' && envPath) {
      return normalizeEnvPath(envPath);
    }
    return DEFAULT_STAGING_API_PATH;
  }

  if (import.meta.env.MODE === 'production' && envPath) {
    return normalizeEnvPath(envPath);
  }

  return DEFAULT_PRODUCTION_API_PATH;
}

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

  return `${origin}${resolveApiPath()}`;
}

export const DEFAULT_BOOTSTRAP_KEY = import.meta.env.VITE_BOOTSTRAP_ADMIN_KEY ?? '';
export { STORAGE_KEY };
