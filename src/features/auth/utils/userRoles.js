import { TENANT_EMPLOYEE_ROLES } from '@/app/constants';
import { isEmployeePortalUser as isEmployeePortalUserAuth } from './authorization';

/**
 * @param {{ role?: string } | null | undefined} user
 */
export function isSuperAdminUser(user) {
  return user?.role === 'SUPER_ADMIN';
}

/**
 * @param {{ role?: string, employeeCode?: string } | null | undefined} user
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} [session]
 */
export function isEmployeeTenantUser(user, session) {
  if (session) {
    return isEmployeePortalUserAuth(user, session);
  }
  return TENANT_EMPLOYEE_ROLES.includes(user?.role) && Boolean(user?.employeeCode);
}

/**
 * @param {{ name?: string, email?: string } | null | undefined} user
 */
export function getUserDisplayName(user) {
  return user?.name || user?.email?.split('@')[0] || 'User';
}
