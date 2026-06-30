import { Alert, Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import {
  canAccessDashboard,
  getAllowedDashboards,
  getDashboardByKey,
} from '@/features/auth/config/dashboardRegistry';

/**
 * Route guard for code-defined dashboards.
 *
 * @param {{
 *   dashboardKey: string,
 *   fallbackTo?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function DashboardRouteGuard({ dashboardKey, fallbackTo, children }) {
  const { session } = useAuth();
  const dashboard = getDashboardByKey(dashboardKey);

  if (!dashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unknown dashboard route.</Alert>
      </Box>
    );
  }

  if (canAccessDashboard(session, dashboard)) {
    return children;
  }

  const allowed = getAllowedDashboards(session);
  const redirectTo =
    fallbackTo ?? allowed.find((d) => d.key !== dashboardKey)?.path ?? allowed[0]?.path;

  if (redirectTo && redirectTo !== dashboard.path) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning">
        You do not have permission to view this dashboard. Contact your administrator if you
        believe this is a mistake.
      </Alert>
    </Box>
  );
}
