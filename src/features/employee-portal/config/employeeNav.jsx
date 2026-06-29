import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { can, hasModule } from '@/features/auth/utils/authorization';

const ICONS = {
  home: DashboardRoundedIcon,
  leave: BeachAccessRoundedIcon,
  attendance: EventNoteRoundedIcon,
  timesheet: ScheduleRoundedIcon,
  settings: SettingsRoundedIcon,
};

export const EMPLOYEE_NAV_CONFIG = [
  {
    key: 'home',
    label: 'Home',
    path: '/dashboard',
    permissions: ['ess.leave:read', 'ess.attendance:read', 'ess.timesheet:read'],
  },
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
      { key: 'holiday-calendar', label: 'Holiday Calendar', path: '/leave/holidays', permission: 'ess.leave:read' },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    expandPathPrefix: '/attendance',
    module: 'attendance',
    permission: 'ess.attendance:read',
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
  { key: 'settings', label: 'Settings', path: '/settings' },
];

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 */
export function filterEmployeeNavConfig(session) {
  return EMPLOYEE_NAV_CONFIG.map((item) => {
    if (item.module && !hasModule(session, item.module)) return null;
    if (item.permission && !can(session, item.permission)) return null;
    if (item.permissions?.length && !item.permissions.some((p) => can(session, p))) return null;

    if (item.children) {
      const children = item.children.filter((child) => {
        if (child.permission && !can(session, child.permission)) return false;
        return true;
      });
      if (children.length === 0) return null;
      return { ...item, children };
    }

    return item;
  }).filter(Boolean);
}

/**
 * @param {string} pathname
 * @param {string} itemPath
 * @param {string} [expandPathPrefix]
 */
function isNavPathActive(pathname, itemPath, expandPathPrefix) {
  if (expandPathPrefix && pathname.startsWith(expandPathPrefix)) {
    return true;
  }
  if (!itemPath) return false;
  if (itemPath === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

/**
 * @param {string} pathname
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} [session]
 * @returns {import('react').ReactNode[]} items for SidebarContent
 */
export function buildEmployeeNavItems(pathname, session) {
  const config = filterEmployeeNavConfig(session);
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
        active: Boolean(child.path) && pathname === child.path,
      })),
    };
  });
}

/**
 * @param {string} pathname
 * @returns {string}
 */
export function getEmployeePageTitle(pathname) {
  for (const item of EMPLOYEE_NAV_CONFIG) {
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
  if (pathname.startsWith('/leave/apply')) return 'Leave Apply';
  if (pathname.startsWith('/timesheet/team') || pathname.startsWith('/timesheet/requests')) {
    return 'Team Timesheets';
  }
  if (pathname.startsWith('/timesheet/add')) return 'Add Timesheet';
  if (pathname.startsWith('/timesheet/edit')) return 'Edit Timesheet';
  if (pathname.startsWith('/timesheet')) return 'My Timesheet';
  return 'Home';
}
