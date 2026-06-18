import { Navigate } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { canAny } from '@/features/auth/utils/authorization';

/**
 * Route guard — redirects or shows denial when module/permission checks fail.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   module?: string,
 *   permission?: string,
 *   permissions?: string[],
 *   permissionsMode?: 'any' | 'all',
 *   fallbackTo?: string,
 *   showAlert?: boolean,
 * }} props
 */
export function RequireAccess({
  children,
  module,
  permission,
  permissions = [],
  permissionsMode = 'any',
  fallbackTo = '/dashboard',
  showAlert = false,
}) {
  const { session, hasModule, can } = useAuthorization();

  if (module && !hasModule(module)) {
    if (showAlert) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">This module is not enabled for your organization.</Alert>
        </Box>
      );
    }
    return <Navigate to={fallbackTo} replace />;
  }

  const required = [
    ...(permission ? [permission] : []),
    ...permissions,
  ];

  if (required.length > 0) {
    const allowed =
      permissionsMode === 'all'
        ? required.every((code) => can(code))
        : canAny(session, required);

    if (!allowed) {
      if (showAlert) {
        return (
          <Box sx={{ p: 3 }}>
            <Alert severity="warning">You do not have permission to access this page.</Alert>
          </Box>
        );
      }
      return <Navigate to={fallbackTo} replace />;
    }
  }

  return children;
}
