import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
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
import {
  DASHBOARDS,
  getAllowedDashboards,
  getDefaultDashboardPath,
  getDashboardByPath,
} from '@/features/auth/config/dashboardRegistry';

const ICONS = {
  home: HomeRoundedIcon,
  dashboard: DashboardRoundedIcon,
  employees: PeopleRoundedIcon,
  leave: BeachAccessRoundedIcon,
  attendance: EventNoteRoundedIcon,
  timesheet: ScheduleRoundedIcon,
  payroll: AttachMoneyRoundedIcon,
  settings: SettingsRoundedIcon,
};

/** Module nav items (excluding dashboards — those come from dashboardRegistry). */
export const TENANT_NAV_CONFIG = [
  {
    key: 'leave',
    label: 'Leave',
    expandPathPrefix: '/leave',
    module: 'leave',
    permission: 'ess.leave:read',
    children: [
      { key: 'leave-apply', label: 'Leave Apply', path: '/leave/apply', permission: 'ess.leave:apply' },
      {
        key: 'leave-requests',
        label: 'Leave Requests',
        path: '/leave/requests',
        permission: 'approvals.leave:read',
      },
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
      {
        key: 'timesheet-team',
        label: 'Team Timesheets',
        path: '/timesheet/team',
        permission: 'approvals.timesheet:read',
      },
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
export function buildDashboardNavItems(session) {
  return getAllowedDashboards(session).map((dashboard) => ({
    key: dashboard.key,
    label: dashboard.label,
    path: dashboard.path,
    iconKey: dashboard.icon,
    isDashboard: true,
  }));
}

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

function isDashboardPath(pathname) {
  return DASHBOARDS.some((d) => d.path === pathname || (pathname === '/' && d.sortOrder === 1));
}

function isNavPathActive(pathname, itemPath, expandPathPrefix) {
  if (expandPathPrefix && pathname.startsWith(expandPathPrefix)) {
    return true;
  }
  if (!itemPath) return false;
  if (isDashboardPath(itemPath)) {
    return pathname === itemPath || pathname === '/';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

/**
 * @param {string} pathname
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} [session]
 */
export function buildTenantNavItems(pathname, session) {
  const dashboardItems = buildDashboardNavItems(session).map((item) => {
    const Icon = ICONS[item.iconKey] ?? DashboardRoundedIcon;
    return {
      ...item,
      icon: <Icon />,
      active: isNavPathActive(pathname, item.path),
      submenuOpen: false,
    };
  });

  const moduleItems = filterTenantNavConfig(session).map((item) => {
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

  return [...dashboardItems, ...moduleItems];
}

/**
 * @param {string} pathname
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} [session]
 * @returns {string}
 */
export function getTenantPageTitle(pathname, session) {
  const dashboard = getDashboardByPath(pathname);
  if (dashboard) return dashboard.label;

  if (pathname.startsWith('/settings')) {
    if (pathname.startsWith('/settings/organization/calendar')) {
      return 'Calendar';
    }
    for (const child of settingsNavChildren(session)) {
      if (pathname === child.path || pathname.startsWith(`${child.path}/`)) {
        return child.label;
      }
    }
    if (pathname.startsWith('/settings/organization')) {
      return 'Organization';
    }
  }

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
  if (pathname.startsWith('/leave/requests')) return 'Leave Requests';
  if (pathname.startsWith('/timesheet/team') || pathname.startsWith('/timesheet/requests')) {
    return 'Team Timesheets';
  }
  if (pathname.startsWith('/employees')) return 'Employees';
  if (pathname.startsWith('/payroll')) return 'Payroll';
  return 'Dashboard';
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @returns {string}
 */
export function getDefaultLandingPath(session) {
  return getDefaultDashboardPath(session);
}
