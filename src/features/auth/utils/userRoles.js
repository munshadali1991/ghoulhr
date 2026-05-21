import { TENANT_EMPLOYEE_ROLES } from '@/app/constants';

/**
 * @param {{ role?: string } | null | undefined} user
 */
export function isSuperAdminUser(user) {
  return user?.role === 'SUPER_ADMIN';
}

/**
 * @param {{ role?: string, employeeCode?: string } | null | undefined} user
 */
export function isEmployeeTenantUser(user) {
  return TENANT_EMPLOYEE_ROLES.includes(user?.role) && Boolean(user?.employeeCode);
}

/**
 * @param {{ name?: string, email?: string } | null | undefined} user
 */
export function getUserDisplayName(user) {
  return user?.name || user?.email?.split('@')[0] || 'User';
}
