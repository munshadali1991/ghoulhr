import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import {
  canAccessSettingsSlugWithAnyRead,
  currentSettingsSlugFromPath,
  firstAllowedSettingsPath,
  isValidSettingsSlug,
} from '@/features/settings/shell/settingsNav';
import { hasModule } from '@/features/auth/utils/authorization';

/**
 * Guards /settings/* — user must have settings or rbac module plus slug-level read access.
 */
export function SettingsRouteGuard({ children, fallbackTo = '/dashboard' }) {
  const { session } = useAuth();
  const location = useLocation();
  const slug = currentSettingsSlugFromPath(location.pathname);

  const hasSettingsModule = hasModule(session, 'settings');
  const hasRbacModule = hasModule(session, 'rbac');
  const hasTimesheetModule = hasModule(session, 'timesheet');

  if (!hasSettingsModule && !hasRbacModule && !hasTimesheetModule) {
    return <Navigate to={fallbackTo} replace />;
  }

  if (location.pathname === '/settings' || (slug && !isValidSettingsSlug(slug))) {
    return <Navigate to={firstAllowedSettingsPath(session)} replace />;
  }

  if (slug && !canAccessSettingsSlugWithAnyRead(session, slug)) {
    return <Navigate to={firstAllowedSettingsPath(session)} replace />;
  }

  return children;
}
