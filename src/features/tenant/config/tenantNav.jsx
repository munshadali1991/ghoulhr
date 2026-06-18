import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import {
  DEFAULT_SETTINGS_PATH,
  settingsNavChildren,
} from '@/features/settings/shell/settingsNav';
import { can, hasModule } from '@/features/auth/utils/authorization';

const ICONS = {
  home: DashboardRoundedIcon,
  dashboard: DashboardRoundedIcon,
  employees: PeopleRoundedIcon,
  leave: BeachAccessRoundedIcon,
  attendance: EventNoteRoundedIcon,
  timesheet: ScheduleRoundedIcon,
  payroll: AttachMoneyRoundedIcon,
  settings: SettingsRoundedIcon,
};

/** Unified tenant nav — ESS + admin items, filtered by RBAC. */
export const TENANT_NAV_CONFIG = [
  {
    key: 'home',
    label: 'Home',
    path: '/home',
    permissions: ['ess.leave:read', 'ess.attendance:read', 'ess.timesheet:read'],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    permissions: ['employees:read', 'settings.organization:read', 'payroll:read'],
  },
  {
    key: 'leave',
    label: 'Leave',
    expandPathPrefix: '/leave',
    module: 'leave',
    permission: 'ess.leave:read',
    children: [
      { key: 'leave-apply', label: 'Leave Apply', path: '/leave/apply', permission: 'ess.leave:apply' },
      { key: 'leave-balances', label: 'Leave Balances', path: '/leave/balances', permission: 'ess.leave:read' },
      { key: 'leave-calendar', label: 'Leave Calendar', path: '/leave/calendar', permission: 'ess.leave:read' },
      { key: 'leave-holidays', label: 'Holiday Calendar', path: '/leave/holidays', permission: 'ess.leave:read' },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    expandPathPrefix: '/attendance',
    module: 'attendance',
    permissions: ['ess.attendance:read'],
    children: [
      { key: 'attendance-info', label: 'Attendance Info', path: '/attendance', permission: 'ess.attendance:read' },
    ],
  },
  {
    key: 'timesheet',
    label: 'Timesheet',
    expandPathPrefix: '/timesheet',
    module: 'timesheet',
    permission: 'ess.timesheet:read',
    children: [
      { key: 'timesheet-my', label: 'My Timesheet', path: '/timesheet', permission: 'ess.timesheet:read' },
      { key: 'timesheet-reports', label: 'My Reports', path: '/timesheet/reports', permission: 'ess.timesheet:read' },
    ],
  },
  { key: 'employees', label: 'Employees', path: '/employees', module: 'employees', permission: 'employees:read' },
  { key: 'payroll', label: 'Payroll', path: '/payroll', module: 'payroll', permission: 'payroll:read' },
  {
    key: 'settings',
    label: 'Settings',
    path: DEFAULT_SETTINGS_PATH,
    expandPathPrefix: '/settings',
    module: 'settings',
  },
];

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 */
export function filterTenantNavConfig(session) {
  return TENANT_NAV_CONFIG.map((item) => {
    if (item.module && !hasModule(session, item.module)) return null;
    if (item.permission && !can(session, item.permission)) return null;
    if (item.permissions?.length && !item.permissions.some((p) => can(session, p))) {
      return null;
    }

    if (item.children) {
      const children = item.children.filter((child) => {
        if (child.permission && !can(session, child.permission)) return false;
        return true;
      });
      if (children.length === 0) return null;
      return { ...item, children };
    }

    if (item.key === 'settings') {
      const children = settingsNavChildren(session);
      if (children.length === 0) return null;
      return { ...item, children };
    }

    return item;
  }).filter(Boolean);
}

function isNavPathActive(pathname, itemPath, expandPathPrefix) {
  if (expandPathPrefix && pathname.startsWith(expandPathPrefix)) {
    return true;
  }
  if (!itemPath) return false;
  if (itemPath === '/dashboard' || itemPath === '/home') {
    return pathname === '/dashboard' || pathname === '/home' || pathname === '/';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

/**
 * @param {string} pathname
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} [session]
 */
export function buildTenantNavItems(pathname, session) {
  const config = filterTenantNavConfig(session);
  return config.map((item) => {
    const Icon = ICONS[item.key];
    const active = isNavPathActive(pathname, item.path, item.expandPathPrefix);
    const submenuOpen =
      Boolean(item.expandPathPrefix) && pathname.startsWith(item.expandPathPrefix);

    return {
      ...item,
      icon: Icon ? <Icon /> : null,
      active,
      submenuOpen,
      children: item.children?.map((child) => ({
        ...child,
        active:
          Boolean(child.path) &&
          (pathname === child.path || pathname.startsWith(`${child.path}/`)),
      })),
    };
  });
}

/**
 * @param {string} pathname
 * @returns {string}
 */
export function getTenantPageTitle(pathname) {
  for (const item of TENANT_NAV_CONFIG) {
    if (item.path && isNavPathActive(pathname, item.path, item.expandPathPrefix) && !item.children) {
      return item.label;
    }
    for (const child of item.children ?? []) {
      if (child.path && (pathname === child.path || pathname.startsWith(`${child.path}/`))) {
        return child.label;
      }
    }
  }
  if (pathname.startsWith('/home')) return 'Home';
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/employees')) return 'Employees';
  if (pathname.startsWith('/payroll')) return 'Payroll';
  return 'Dashboard';
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @returns {string}
 */
export function getDefaultLandingPath(session) {
  const hasEss =
    can(session, 'ess.leave:read') ||
    can(session, 'ess.attendance:read') ||
    can(session, 'ess.timesheet:read');
  if (hasEss) return '/home';
  return '/dashboard';
}
