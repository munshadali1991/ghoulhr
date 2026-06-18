import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import {
  DEFAULT_SETTINGS_PATH,
  settingsNavChildren,
} from '@/features/settings/shell/settingsNav';
import { can, hasModule } from '@/features/auth/utils/authorization';

const ICONS = {
  dashboard: DashboardRoundedIcon,
  employees: PeopleRoundedIcon,
  attendance: EventNoteRoundedIcon,
  payroll: AttachMoneyRoundedIcon,
  settings: SettingsRoundedIcon,
};

/** Nav entries without JSX (paths + keys). */
export const ORG_ADMIN_NAV_CONFIG = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'employees', label: 'Employees', path: '/employees', module: 'employees', permission: 'employees:read' },
  { key: 'attendance', label: 'Attendance', path: '/attendance', module: 'attendance' },
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
export function filterOrgAdminNavConfig(session) {
  return ORG_ADMIN_NAV_CONFIG.filter((item) => {
    if (item.module && !hasModule(session, item.module)) return false;
    if (item.permission && !can(session, item.permission)) return false;
    return true;
  }).map((item) => {
    if (item.key === 'settings') {
      return { ...item, children: settingsNavChildren(session) };
    }
    return item;
  }).filter((item) => item.key !== 'settings' || (item.children?.length ?? 0) > 0);
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
export function buildOrgAdminNavItems(pathname, session) {
  const config = filterOrgAdminNavConfig(session);
  return config.map((item) => {
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
