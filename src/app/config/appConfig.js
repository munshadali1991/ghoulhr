import { isStagingRuntime } from '@/shared/utils/tenant';

const STORAGE_KEY = 'ghoulhr_session';

export const APP_NAME = 'peopleAIQ';
export const APP_BRAND_INITIALS = 'pA';

const DEFAULT_STAGING_API_PATH = '/staging/api/v1';
const DEFAULT_PRODUCTION_API_PATH = '/api/v1';

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

const DEFAULT_PUBLIC_APP_DOMAIN = 'peopleaiq.com';

/**
 * Public apex domain used in tenant host labels (e.g. nqt.peopleaiq.com).
 * Prefer VITE_APP_PUBLIC_DOMAIN, then derive from the current host, then default.
 */
export function getPublicAppDomain() {
  const fromEnv = import.meta.env.VITE_APP_PUBLIC_DOMAIN?.trim().toLowerCase();
  if (fromEnv) {
    return fromEnv.replace(/^\.+/, '');
  }

  if (typeof window === 'undefined') {
    return DEFAULT_PUBLIC_APP_DOMAIN;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost')
  ) {
    return DEFAULT_PUBLIC_APP_DOMAIN;
  }

  // Skip bare IPs (e.g. 3.26.99.219)
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return DEFAULT_PUBLIC_APP_DOMAIN;
  }

  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return DEFAULT_PUBLIC_APP_DOMAIN;
}

export function formatTenantHostname(subdomain) {
  const slug = String(subdomain || '')
    .trim()
    .toLowerCase();
  if (!slug) {
    return getPublicAppDomain();
  }
  return `${slug}.${getPublicAppDomain()}`;
}
