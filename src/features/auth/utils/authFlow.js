import {
  bootstrapSuperAdminRequest,
  employeeLoginRequest,
  loginRequest,
} from '@/features/auth/api/authApi';
import { getTenantRedirectUrl } from '@/shared/utils/tenant';

/**
 * @param {{ role?: string, organizationSubdomain?: string } | null | undefined} user
 * @returns {string | null}
 */
export function resolvePostAuthRedirect(user) {
  if (!user || user.role === 'SUPER_ADMIN') return null;
  return getTenantRedirectUrl(user.organizationSubdomain) || null;
}

/**
 * @param {{ user?: object }} authResult
 * @param {(session: { user: object }) => void} setSession
 * @returns {boolean} True when a full-page redirect was started.
 */
export function applyAuthResult(authResult, setSession) {
  if (!authResult?.user) {
    throw new Error('Login failed. Invalid response from server.');
  }

  setSession({ user: authResult.user });
  const redirectUrl = resolvePostAuthRedirect(authResult.user);
  if (redirectUrl) {
    window.location.assign(redirectUrl);
    return true;
  }
  return false;
}

/**
 * @param {'admin' | 'employee'} mode
 * @param {{ email: string, password: string }} credentials
 */
export async function authenticate(mode, { email, password }) {
  if (mode === 'employee') {
    return employeeLoginRequest(email, password);
  }
  return loginRequest(email, password);
}

/**
 * @param {{ email: string, password: string }} credentials
 */
export async function authenticateWithBootstrap(credentials) {
  return bootstrapSuperAdminRequest(credentials.email, credentials.password);
}
