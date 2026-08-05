import { Navigate } from 'react-router-dom';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

/**
 * Route-level permission guard (single permission or resource read/write).
 *
 * @param {{
 *   permission?: string,
 *   permissions?: string[],
 *   permissionsMode?: 'any' | 'all',
 *   resource?: string,
 *   mode?: 'read' | 'write',
 *   fallbackTo?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function RequirePermission({
  permission,
  permissions,
  permissionsMode = 'any',
  resource,
  mode = 'read',
  fallbackTo = '/dashboard',
  children,
}) {
  const { can, canAny, canAll, canRead, canWrite } = useAuthorization();

  let allowed = false;
  if (resource) {
    allowed = mode === 'write' ? canWrite(resource) : canRead(resource);
  } else if (permission) {
    allowed = can(permission);
  } else if (permissions?.length) {
    allowed =
      permissionsMode === 'all' ? canAll(permissions) : canAny(permissions);
  }

  if (!allowed) {
    return <Navigate to={fallbackTo} replace />;
  }

  return children;
}
