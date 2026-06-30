import { can, canAny, hasModule } from '@/features/auth/utils/authorization';

/**
 * @typedef {Object} DashboardWidgetDef
 * @property {string} key
 * @property {string} [read]
 * @property {string} [write]
 * @property {string} [punch]
 * @property {string} [permission]
 * @property {string[]} [permissions]
 */

/**
 * @typedef {Object} DashboardDef
 * @property {string} key
 * @property {string} label
 * @property {string} path
 * @property {string} read
 * @property {string} [module] - platform module entitlement
 * @property {string} icon
 * @property {number} sortOrder
 * @property {DashboardWidgetDef[]} [widgets]
 */

/** @type {DashboardDef[]} */
export const DASHBOARDS = [
  {
    key: 'ess',
    label: 'Home',
    path: '/home',
    read: 'dashboard.ess:read',
    icon: 'home',
    sortOrder: 1,
    widgets: [
      { key: 'timesheet', read: 'ess.timesheet:read', write: 'ess.timesheet:write' },
      { key: 'attendance-punch', read: 'ess.attendance:read', punch: 'ess.attendance:punch' },
      { key: 'leave-pending', read: 'ess.leave:read' },
      { key: 'holidays', read: 'ess.leave:read' },
      { key: 'payslip', read: 'payroll:read' },
      { key: 'quick-access', read: 'ess.leave:read' },
    ],
  },
  {
    key: 'hr',
    label: 'Dashboard',
    path: '/dashboard',
    read: 'dashboard.hr:read',
    icon: 'dashboard',
    sortOrder: 2,
    widgets: [
      { key: 'employees-tile', permission: 'employees:read' },
      { key: 'attendance-tile', permission: 'employees:read' },
      { key: 'payroll-tile', permission: 'payroll:read' },
      { key: 'settings-tile', permissions: ['settings.organization:read', 'settings.employees:read'] },
    ],
  },
];

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {DashboardDef} dashboard
 */
export function canAccessDashboard(session, dashboard) {
  if (!dashboard) return false;
  if (dashboard.module && session && !hasModule(session, dashboard.module)) {
    return false;
  }
  if (can(session, dashboard.read)) return true;

  // Fallback when dashboard.* permissions are not synced yet but ESS access exists.
  if (dashboard.key === 'ess') {
    return canAny(session, [
      'ess.leave:read',
      'ess.attendance:read',
      'ess.timesheet:read',
    ]);
  }
  if (dashboard.key === 'hr') {
    return canAny(session, ['employees:read', 'settings.organization:read']);
  }

  return false;
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @returns {DashboardDef[]}
 */
export function getAllowedDashboards(session) {
  return [...DASHBOARDS]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((d) => canAccessDashboard(session, d));
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @returns {string}
 */
export function getDefaultDashboardPath(session) {
  return getAllowedDashboards(session)[0]?.path ?? '/home';
}

/**
 * @param {string} path
 * @returns {DashboardDef | null}
 */
export function getDashboardByPath(path) {
  return DASHBOARDS.find((d) => d.path === path) ?? null;
}

/**
 * @param {string} key
 * @returns {DashboardDef | null}
 */
export function getDashboardByKey(key) {
  return DASHBOARDS.find((d) => d.key === key) ?? null;
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {DashboardWidgetDef} widget
 */
export function canAccessDashboardWidget(session, widget) {
  if (!widget) return false;
  if (widget.permission) return can(session, widget.permission);
  if (widget.permissions?.length) {
    return widget.permissions.some((p) => can(session, p));
  }
  if (widget.read) return can(session, widget.read);
  return true;
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {string} dashboardKey
 * @param {string} widgetKey
 */
export function canAccessDashboardWidgetByKey(session, dashboardKey, widgetKey) {
  const dashboard = getDashboardByKey(dashboardKey);
  const widget = dashboard?.widgets?.find((w) => w.key === widgetKey);
  return canAccessDashboardWidget(session, widget);
}
