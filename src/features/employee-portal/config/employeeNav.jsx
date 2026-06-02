import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const ICONS = {
  home: DashboardRoundedIcon,
  leave: BeachAccessRoundedIcon,
  attendance: EventNoteRoundedIcon,
  timesheet: ScheduleRoundedIcon,
  profile: PersonRoundedIcon,
  settings: SettingsRoundedIcon,
};

export const EMPLOYEE_NAV_CONFIG = [
  { key: 'home', label: 'Home', path: '/dashboard' },
  {
    key: 'leave',
    label: 'Leave',
    expandPathPrefix: '/leave',
    children: [
      { key: 'leave-apply', label: 'Leave Apply', path: '/leave/apply' },
      { key: 'leave-balances', label: 'Leave Balances', path: '/leave/balances' },
      { key: 'leave-calendar', label: 'Leave Calendar', path: '/leave/calendar' },
      { key: 'holiday-calendar', label: 'Holiday Calendar', path: '/leave/holidays' },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    expandPathPrefix: '/attendance',
    children: [
      { key: 'attendance-info', label: 'Attendance Info', path: '/attendance' },
    ],
  },
  {
    key: 'timesheet',
    label: 'Timesheet',
    expandPathPrefix: '/timesheet',
    children: [
      { key: 'timesheet-my', label: 'My Timesheet', path: '/timesheet' },
      { key: 'timesheet-reports', label: 'My Reports', path: '/timesheet/reports' },
    ],
  },
  { key: 'profile', label: 'My Profile', path: '/profile' },
  { key: 'settings', label: 'Settings', path: '/settings' },
];

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
 */
export function buildEmployeeNavItems(pathname) {
  return EMPLOYEE_NAV_CONFIG.map((item) => {
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
  if (pathname.startsWith('/leave/apply')) return 'Leave Apply';
  if (pathname === '/timesheet/reports') return 'My Reports';
  if (pathname.startsWith('/timesheet/add')) return 'Add Timesheet';
  if (pathname.startsWith('/timesheet/edit')) return 'Edit Timesheet';
  if (pathname.startsWith('/timesheet')) return 'My Timesheet';
  return 'Home';
}
