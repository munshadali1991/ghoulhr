/**
 * Central access registry — maps modules, settings sections, inner tabs, and actions
 * to permission codes. Frontend source of truth for nav, routes, and UI gating.
 *
 * @typedef {Object} TabAccessDef
 * @property {string} key
 * @property {string} [label]
 * @property {string} read - permission code required to view tab
 * @property {string} [write] - permission code required to mutate
 * @property {Record<string, string>} [actions] - named action → permission code
 *
 * @typedef {Object} SettingsSectionDef
 * @property {string} slug
 * @property {string} label
 * @property {string} module - platform module entitlement code
 * @property {string} [read] - single read permission
 * @property {string[]} [readAny] - any of these read permissions grants section access
 * @property {string} [write]
 * @property {TabAccessDef[]} [tabs]
 * @property {string} [apiRead] - backend route hint
 * @property {string} [apiWrite]
 */

import { DASHBOARDS } from '@/features/auth/config/dashboardRegistry';

/** @type {Record<string, SettingsSectionDef>} */
export const SETTINGS_ACCESS = {
  organization: {
    slug: 'organization',
    label: 'Organization',
    module: 'settings',
    read: 'settings.organization:read',
    write: 'settings.organization:write',
    apiRead: 'GET /settings/organization',
    apiWrite: 'POST /settings/organization',
    tabs: [
      {
        key: 'profile',
        label: 'Profile',
        read: 'settings.organization:read',
        write: 'settings.organization:write',
      },
      {
        key: 'calendar',
        label: 'Calendar',
        read: 'settings.organization:read',
        write: 'settings.organization:write',
      },
    ],
  },
  employees: {
    slug: 'employees',
    label: 'Employees',
    module: 'settings',
    read: 'settings.employees:read',
    write: 'settings.employees:write',
    apiRead: 'GET /settings/employee',
    apiWrite: 'POST /settings/employee',
  },
  departments: {
    slug: 'departments',
    label: 'Departments & Designations',
    module: 'settings',
    readAny: ['settings.departments:read', 'settings.designations:read'],
    write: 'settings.employees:write',
    tabs: [
      {
        key: 'departments',
        label: 'Departments',
        read: 'settings.departments:read',
        write: 'settings.departments:write',
      },
      {
        key: 'designations',
        label: 'Designations',
        read: 'settings.designations:read',
        write: 'settings.designations:write',
      },
    ],
    apiRead: 'GET /settings/departments, GET /settings/designations',
    apiWrite: 'POST /settings/departments, POST /settings/designations',
  },
  locations: {
    slug: 'locations',
    label: 'Locations',
    module: 'settings',
    read: 'settings.locations:read',
    write: 'settings.locations:write',
    apiRead: 'GET /settings/locations',
    apiWrite: 'POST /settings/locations',
  },
  leave: {
    slug: 'leave',
    label: 'Leave config',
    module: 'settings',
    read: 'settings.leave:read',
    write: 'settings.leave:write',
    apiRead: 'GET /settings/leave-config',
    apiWrite: 'POST /settings/leave-config',
  },
  attendance: {
    slug: 'attendance',
    label: 'Attendance',
    module: 'settings',
    read: 'settings.attendance:read',
    write: 'settings.attendance:write',
    apiRead: 'GET /settings/attendance',
    apiWrite: 'POST /settings/attendance',
    tabs: [
      { key: 'shifts', label: 'Shifts', read: 'settings.attendance:read', write: 'settings.attendance:write' },
      { key: 'schedule', label: 'Schedule & rules', read: 'settings.attendance:read', write: 'settings.attendance:write' },
      { key: 'checkin', label: 'Check-in', read: 'settings.attendance:read', write: 'settings.attendance:write' },
    ],
  },
  timesheet: {
    slug: 'timesheet',
    label: 'Timesheet',
    module: 'timesheet',
    read: 'settings.timesheet:read',
    write: 'settings.timesheet:write',
    apiRead: 'GET /settings/timesheet',
    apiWrite: 'POST /settings/timesheet',
    tabs: [
      { key: 'general', label: 'General', read: 'settings.timesheet:read', write: 'settings.timesheet:write' },
      { key: 'category', label: 'Category', read: 'settings.timesheet:read', write: 'settings.timesheet:write' },
    ],
  },
  rbac: {
    slug: 'rbac',
    label: 'Roles & Permissions',
    module: 'rbac',
    read: 'rbac:read',
    write: 'rbac:manage',
    apiRead: 'GET /rbac/*',
    apiWrite: 'PATCH /rbac/*',
    tabs: [
      { key: 'roles', label: 'Role catalog', read: 'rbac:read', write: 'rbac:manage' },
      { key: 'employees', label: 'Employee access', read: 'rbac:read', write: 'rbac:manage' },
      { key: 'audit', label: 'Audit trail', read: 'rbac:read' },
    ],
  },
};

/** Ordered settings slugs for nav and redirects. */
export const SETTINGS_SLUG_ORDER = [
  'organization',
  'employees',
  'departments',
  'locations',
  'leave',
  'attendance',
  'timesheet',
  'rbac',
];

/** @type {{ module: string, tabs: TabAccessDef[] }} */
export const EMPLOYEES_MODULE_ACCESS = {
  module: 'employees',
  tabs: [
    {
      key: 'directory',
      label: 'Employee directory',
      read: 'employees:read',
      actions: {
        create: 'employees:create',
        update: 'employees:update',
        onboard: 'employees:onboard',
        resetPassword: 'employees:reset-password',
      },
    },
    {
      key: 'reporting-managers',
      label: 'Reporting managers',
      read: 'employees:reporting-manager:read',
      write: 'employees:reporting-manager:assign',
    },
  ],
};

/** @type {Record<string, { module: string, permission?: string, permissions?: string[], permissionsMode?: string }>} */
export const ESS_ACCESS = {
  home: {
    module: 'leave',
    permissions: ['ess.leave:read', 'ess.attendance:read', 'ess.timesheet:read'],
    permissionsMode: 'any',
  },
  leaveApply: { module: 'leave', permission: 'ess.leave:apply' },
  leaveRead: { module: 'leave', permission: 'ess.leave:read' },
  attendanceRead: { module: 'attendance', permission: 'ess.attendance:read' },
  attendancePunch: { module: 'attendance', permission: 'ess.attendance:punch' },
  timesheetRead: { module: 'timesheet', permission: 'ess.timesheet:read' },
  timesheetWrite: { module: 'timesheet', permission: 'ess.timesheet:write' },
};

/** @type {Record<string, { permission: string }>} */
export const APPROVALS_ACCESS = {
  leaveRead: { permission: 'approvals.leave:read' },
  leaveAct: { permission: 'approvals.leave:act' },
  timesheetRead: { permission: 'approvals.timesheet:read' },
  timesheetAct: { permission: 'approvals.timesheet:act' },
};

/** @type {{ module: string, read: string, write: string, run: string }} */
export const PAYROLL_ACCESS = {
  module: 'payroll',
  read: 'payroll:read',
  write: 'payroll:write',
  run: 'payroll:run',
};

export {
  DASHBOARDS,
  getAllowedDashboards,
  getDefaultDashboardPath,
  getDashboardByKey,
  getDashboardByPath,
  canAccessDashboard,
  canAccessDashboardWidget,
  canAccessDashboardWidgetByKey,
} from '@/features/auth/config/dashboardRegistry';

export const ACCESS_REGISTRY = {
  settings: SETTINGS_ACCESS,
  employees: EMPLOYEES_MODULE_ACCESS,
  ess: ESS_ACCESS,
  approvals: APPROVALS_ACCESS,
  payroll: PAYROLL_ACCESS,
  dashboards: DASHBOARDS,
};

/**
 * Build SETTINGS_SECTIONS array for nav from registry.
 * @returns {Array<{ slug: string, label: string, module: string, permission?: string, readAny?: string[], write: string }>}
 */
export function buildSettingsSections() {
  return SETTINGS_SLUG_ORDER.map((slug) => {
    const section = SETTINGS_ACCESS[slug];
    return {
      slug: section.slug,
      label: section.label,
      module: section.module,
      permission: section.read,
      readAny: section.readAny,
      write: section.write,
    };
  });
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {SettingsSectionDef} section
 */
export function canAccessSettingsSection(session, section) {
  if (section.module && session && !session.entitledModules?.includes(section.module)) {
    return false;
  }
  if (section.readAny?.length) {
    const perms = session?.permissions ?? [];
    return section.readAny.some((c) => perms.includes(c));
  }
  if (section.read && session && !session.permissions?.includes(section.read)) {
    return false;
  }
  return true;
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {string} slug
 */
export function getSettingsSectionBySlug(slug) {
  return SETTINGS_ACCESS[slug] ?? null;
}
