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
  if (isLocalHost) {
    const targetHost = `${organizationSubdomain}.localhost`;
    if (hostname === targetHost) {
      return null;
    }
    return `${protocol}//${targetHost}${portPart}`;
  }

  const hostParts = hostname.split('.');
  if (hostParts.length < 2) {
    return null;
  }

  const rootDomain = hostParts.slice(-2).join('.');
  const targetHost = `${organizationSubdomain}.${rootDomain}`;
  if (hostname === targetHost) {
    return null;
  }

  return `${protocol}//${targetHost}${portPart}`;
}
