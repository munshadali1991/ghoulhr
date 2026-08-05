import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

/**
 * Declarative permission gate — renders children only when allowed.
 *
 * @param {{
 *   permission?: string,
 *   permissions?: string[],
 *   permissionsMode?: 'any' | 'all',
 *   resource?: string,
 *   mode?: 'read' | 'write',
 *   fallback?: import('react').ReactNode,
 *   children: import('react').ReactNode,
 * }} props
 */
export function Can({
  permission,
  permissions,
  permissionsMode = 'any',
  resource,
  mode = 'read',
  fallback = null,
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

  return allowed ? children : fallback;
}

/**
 * Inverse of Can — renders when permission is missing (read-only banners, etc.).
 */
export function Cannot({ permission, resource, mode = 'write', children }) {
  const { can, canRead, canWrite } = useAuthorization();
  const denied = resource
    ? mode === 'write'
      ? !canWrite(resource)
      : !canRead(resource)
    : permission
      ? !can(permission)
      : true;
  return denied ? children : null;
}
