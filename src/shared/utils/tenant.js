/** True when the app is running in staging (build base or URL path). */
export function isStagingRuntime() {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base !== '/') {
    return true;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/staging')
  ) {
    return true;
  }
  return false;
}

/** Vite BASE_URL without trailing slash; empty for production (`/`). */
export function getAppBasePath() {
  if (!isStagingRuntime()) {
    return '';
  }
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') {
    return '/staging';
  }
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export function getTenantRedirectUrl(organizationSubdomain) {
  if (!organizationSubdomain || typeof window === 'undefined') {
    return null;
  }

  const { protocol, hostname, port } = window.location;
  const appBasePath = getAppBasePath();
  const currentSubdomain = hostname.split('.')[0];
  if (currentSubdomain === organizationSubdomain) {
    return null;
  }

  const portPart = port ? `:${port}` : '';
  const isLocalHost = hostname === 'localhost' || hostname.endsWith('.localhost');

  let targetHost;
  if (isLocalHost) {
    targetHost = `${organizationSubdomain}.localhost`;
    if (hostname === targetHost) {
      return null;
    }
  } else {
    const hostParts = hostname.split('.');
    if (hostParts.length < 2) {
      return null;
    }
    const rootDomain = hostParts.slice(-2).join('.');
    targetHost = `${organizationSubdomain}.${rootDomain}`;
    if (hostname === targetHost) {
      return null;
    }
  }

  return `${protocol}//${targetHost}${portPart}${appBasePath}`;
}

/** True when the app is served on a tenant subdomain (not bare localhost / apex). */
export function isOnTenantSubdomain() {
  if (typeof window === 'undefined') {
    return false;
  }
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  if (hostname.endsWith('.localhost')) {
    return hostname !== 'localhost';
  }
  return hostname.split('.').length > 2;
}
