import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { getDefaultDashboardPath } from '@/features/auth/config/dashboardRegistry';

/**
 * Redirects users who must change password to /change-password,
 * and users who already changed password away from that page.
 */
export function RequirePasswordChanged({ children }) {
  const { user, session } = useAuth();
  const location = useLocation();
  const mustChange = Boolean(user?.mustChangePassword);
  const onChangePasswordPage = location.pathname === '/change-password';

  if (mustChange && !onChangePasswordPage) {
    return <Navigate to="/change-password" replace />;
  }

  if (!mustChange && onChangePasswordPage) {
    return <Navigate to={getDefaultDashboardPath(session)} replace />;
  }

  return children;
}
