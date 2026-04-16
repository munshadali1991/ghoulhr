export function getTenantRedirectUrl(organizationSubdomain, sessionData = null) {
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

  // If session data is provided, encode it in URL for cross-subdomain transfer
  let url = `${protocol}//${targetHost}${portPart}`;
  if (sessionData) {
    try {
      const encodedSession = btoa(JSON.stringify(sessionData));
      url += `?session=${encodedSession}`;
    } catch (error) {
      console.error('Failed to encode session data:', error);
    }
  }
  
  return url;
}
