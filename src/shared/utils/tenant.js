export function getTenantRedirectUrl(organizationSubdomain) {
  if (!organizationSubdomain || typeof window === 'undefined') {
    return null;
  }

  const { protocol, hostname, port } = window.location;
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

  return `${protocol}//${targetHost}${portPart}`;
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
