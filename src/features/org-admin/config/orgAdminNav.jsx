import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import {
  DEFAULT_SETTINGS_PATH,
  settingsNavChildren,
} from '@/features/settings/shell/settingsNav';

const ICONS = {
  dashboard: DashboardRoundedIcon,
  employees: PeopleRoundedIcon,
  attendance: EventNoteRoundedIcon,
  payroll: AttachMoneyRoundedIcon,
  tracking: TimelineRoundedIcon,
  settings: SettingsRoundedIcon,
};

/** Nav entries without JSX (paths + keys). */
export const ORG_ADMIN_NAV_CONFIG = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'employees', label: 'Employees', path: '/employees' },
  { key: 'attendance', label: 'Attendance', path: '/attendance' },
  { key: 'payroll', label: 'Payroll', path: '/payroll' },
  { key: 'tracking', label: 'Tracking', path: '/tracking' },
  {
    key: 'settings',
    label: 'Settings',
    path: DEFAULT_SETTINGS_PATH,
    expandPathPrefix: '/settings',
    children: settingsNavChildren(),
  },
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
 * @returns {import('react').ReactNode[]} items for SidebarContent
 */
export function buildOrgAdminNavItems(pathname) {
  return ORG_ADMIN_NAV_CONFIG.map((item) => {
    const Icon = ICONS[item.key];
    const active = isNavPathActive(pathname, item.path, item.expandPathPrefix);
    return {
      ...item,
      icon: Icon ? <Icon /> : null,
      active,
      children: item.children?.map((child) => ({
        ...child,
        active:
          Boolean(child.path) &&
          (pathname === child.path || pathname.startsWith(`${child.path}/`)),
      })),
    };
  });
}
