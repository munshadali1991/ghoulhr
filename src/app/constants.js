export const EMPTY_SUPER_ADMIN_STATS = {
  totalOrganizations: 0,
  totalUsers: 0,
  totalRevenue: 0,
  organizationGrowth: [],
};

export const SUPER_ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Organizations', path: '/organizations' },
];

/** Tenant roles that use the employee dashboard when `employeeCode` is present. */
export const TENANT_EMPLOYEE_ROLES = ['EMPLOYEE', 'MANAGER', 'ORG_ADMIN', 'TEAM_LEAD'];

/** Super admin login route (platform control panel). */
export const ADMIN_CP_PATH = '/admin-cp';
