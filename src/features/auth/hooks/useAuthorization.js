import { useMemo } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import { can, canAny, hasModule } from '@/features/auth/utils/authorization';

export function useAuthorization() {
  const { session } = useAuth();

  return useMemo(
    () => ({
      session,
      entitledModules: session?.entitledModules ?? [],
      permissions: session?.permissions ?? [],
      roles: session?.roles ?? [],
      hasModule: (moduleCode) => hasModule(session, moduleCode),
      can: (permissionCode) => can(session, permissionCode),
      canAny: (permissionCodes) => canAny(session, permissionCodes),
    }),
    [session],
  );
}
