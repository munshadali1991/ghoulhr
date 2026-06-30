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
 * @param {{ user?: object, entitledModules?: string[], permissions?: string[], roles?: string[] }} authResult
 * @param {(session: import('@/app/providers/authContext').AuthSession) => void} setSession
 * @returns {boolean} True when a full-page redirect was started.
 */
export async function applyAuthResult(authResult, setSession) {
  if (!authResult?.user) {
    throw new Error('Login failed. Invalid response from server.');
  }

  const { fetchSession } = await import('@/features/auth/api/authApi');
  const session = (await fetchSession()) ?? {
    user: authResult.user,
    entitledModules: [],
    permissions: [],
    roles: [authResult.user.role].filter(Boolean),
  };

  setSession(session);

  const mustChangePassword =
    authResult.requiresPasswordChange ||
    authResult.user?.mustChangePassword ||
    session.user?.mustChangePassword;

  if (mustChangePassword) {
    const redirectUrl = resolvePostAuthRedirect(authResult.user);
    if (redirectUrl) {
      const url = new URL(redirectUrl);
      url.pathname = '/change-password';
      if (authResult.handoff) {
        url.searchParams.set('handoff', authResult.handoff);
      }
      window.location.assign(url.toString());
      return true;
    }
    const base = getAppBasePath();
    window.location.assign(`${base}/change-password`);
    return true;
  }

  const redirectUrl = resolvePostAuthRedirect(authResult.user);
  if (redirectUrl) {
    const url = new URL(redirectUrl);
    if (authResult.handoff) {
      url.searchParams.set('handoff', authResult.handoff);
    }
    window.location.assign(url.toString());
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
