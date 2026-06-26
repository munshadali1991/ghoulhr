import { useMemo } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import {
  can,
  canAll,
  canAny,
  canAccessTab,
  canRead,
  canWrite,
  canWriteTab,
  getAllowedTabs,
  getFirstAllowedTabKey,
  hasModule,
} from '@/features/auth/utils/authorization';

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
      canAll: (permissionCodes) => canAll(session, permissionCodes),
      canRead: (resourceOrCode) => canRead(session, resourceOrCode),
      canWrite: (resourceOrCode) => canWrite(session, resourceOrCode),
      canAccessTab: (tabDef) => canAccessTab(session, tabDef),
      canWriteTab: (tabDef) => canWriteTab(session, tabDef),
      getAllowedTabs: (tabs) => getAllowedTabs(session, tabs),
      getFirstAllowedTabKey: (tabs) => getFirstAllowedTabKey(session, tabs),
    }),
    [session],
  );
}

/**
 * @param {import('@/features/auth/config/accessRegistry').TabAccessDef[]} tabs
 */
export function useTabAccess(tabs) {
  const { session, canAccessTab, canWriteTab, getAllowedTabs, getFirstAllowedTabKey } =
    useAuthorization();

  return useMemo(() => {
    const allowedTabs = getAllowedTabs(tabs);
    const firstAllowedKey = getFirstAllowedTabKey(tabs);
    return {
      session,
      allowedTabs,
      firstAllowedKey,
      canAccessTab,
      canWriteTab,
      isTabAllowed: (key) => allowedTabs.some((t) => t.key === key),
      canWriteAnyTab: allowedTabs.some((t) => canWriteTab(t)),
    };
  }, [session, tabs, canAccessTab, canWriteTab, getAllowedTabs, getFirstAllowedTabKey]);
}
