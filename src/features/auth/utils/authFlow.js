import {
  bootstrapSuperAdminRequest,
  loginRequest,
} from '@/features/auth/api/authApi';
import { getTenantRedirectUrl } from '@/shared/utils/tenant';
import { getAppBasePath } from '@/shared/utils/tenant';

/**
 * @param {{ role?: string, organizationSubdomain?: string } | null | undefined} user
 * @returns {string | null}
 */
export function resolvePostAuthRedirect(user) {
  if (!user || user.role === 'SUPER_ADMIN') return null;
  return getTenantRedirectUrl(user.organizationSubdomain) || null;
}

/**
 * @param {string} redirectUrl
 * @param {{ handoff?: string }} authResult
 * @param {string} [pathSuffix]
 */
function assignPostAuthRedirect(redirectUrl, authResult, pathSuffix = '') {
  const url = new URL(redirectUrl);
  const base = getAppBasePath();
  if (pathSuffix) {
    url.pathname = base ? `${base}${pathSuffix}` : pathSuffix;
  }
  const handoff = authResult?.handoff;
  if (typeof handoff === 'string' && handoff.length > 0) {
    url.searchParams.set('handoff', handoff);
  }
  window.location.replace(url.toString());
}

/**
 * @param {{ user?: object, entitledModules?: string[], permissions?: string[], roles?: string[] }} authResult
 * @param {(session: import('@/app/providers/authContext').AuthSession) => void} setSession
 * @returns {boolean} True when a full-page redirect was started.
 */
export async function applyAuthResult(authResult, setSession) {
  if (!authResult?.user) {
    throw new Error('Login failed. Invalid response from server.');
  }

  const mustChangePassword =
    authResult.requiresPasswordChange || authResult.user?.mustChangePassword;

  const redirectUrl = resolvePostAuthRedirect(authResult.user);

  if (redirectUrl) {
    if (mustChangePassword) {
      assignPostAuthRedirect(redirectUrl, authResult, '/change-password');
      return true;
    }
    assignPostAuthRedirect(redirectUrl, authResult);
    return true;
  }

  const { fetchSession } = await import('@/features/auth/api/authApi');
  const session = (await fetchSession()) ?? {
    user: authResult.user,
    entitledModules: [],
    permissions: [],
    roles: [authResult.user.role].filter(Boolean),
  };

  setSession(session);

  const needsPasswordChange =
    mustChangePassword || session.user?.mustChangePassword;

  if (needsPasswordChange) {
    const base = getAppBasePath();
    window.location.assign(`${base}/change-password`);
    return true;
  }

  return false;
}

/**
 * @param {'tenant' | 'admin'} mode
 * @param {{ email: string, password: string }} credentials
 */
export async function authenticate(mode, { email, password }) {
  if (mode === 'admin') {
    return loginRequest(email, password);
  }
  return loginRequest(email, password);
}

/**
 * @param {{ email: string, password: string }} credentials
 */
export async function authenticateWithBootstrap(credentials) {
  return bootstrapSuperAdminRequest(credentials.email, credentials.password);
}
