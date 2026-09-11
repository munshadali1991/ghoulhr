import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

const ICONS = {
  dashboard: DashboardRoundedIcon,
  organizations: BusinessRoundedIcon,
  leads: PeopleAltRoundedIcon,
};

/** Nav entries without JSX (paths + keys). */
export const SUPER_ADMIN_NAV_CONFIG = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'organizations', label: 'Organizations', path: '/organizations' },
  { key: 'leads', label: 'Leads', path: '/leads' },
];

/**
 * @param {string} pathname
 * @param {string} itemPath
 */
function isNavPathActive(pathname, itemPath) {
  if (!itemPath) return false;
  if (itemPath === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

/**
 * @param {string} pathname
 * @returns {object[]} items for SidebarContent
 */
export function buildSuperAdminNavItems(pathname) {
  return SUPER_ADMIN_NAV_CONFIG.map((item) => {
    const Icon = ICONS[item.key];
    return {
      ...item,
      icon: Icon ? <Icon /> : null,
      active: isNavPathActive(pathname, item.path),
    };
  });
}
