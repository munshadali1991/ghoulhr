import { SETTINGS_ACCESS } from '@/features/auth/config/accessRegistry';

export const RBAC_TABS = {
  roles: 'roles',
  employees: 'employees',
  audit: 'audit',
};

export const RBAC_TAB_DEFS = SETTINGS_ACCESS.rbac.tabs;

export const RBAC_BASE_PATH = '/settings/rbac';
export const RBAC_ROLES_PATH = '/settings/rbac/roles';
export const RBAC_EMPLOYEES_PATH = '/settings/rbac/employees';
export const RBAC_AUDIT_PATH = '/settings/rbac/audit';

/**
 * @param {string} pathname
 */
export function rbacTabFromPath(pathname) {
  const segments = pathname.replace(/\/$/, '').split('/');
  const rbacIndex = segments.indexOf('rbac');
  if (rbacIndex === -1) return RBAC_TABS.roles;

  const subTab = segments[rbacIndex + 1];
  if (subTab === RBAC_TABS.employees) return RBAC_TABS.employees;
  if (subTab === RBAC_TABS.audit) return RBAC_TABS.audit;
  return RBAC_TABS.roles;
}

/**
 * @param {string} tab
 */
export function rbacPathForTab(tab) {
  switch (tab) {
    case RBAC_TABS.employees:
      return RBAC_EMPLOYEES_PATH;
    case RBAC_TABS.audit:
      return RBAC_AUDIT_PATH;
    default:
      return RBAC_ROLES_PATH;
  }
}
