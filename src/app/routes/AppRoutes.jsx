import { Navigate, Route, Routes } from 'react-router-dom';
import { TenantRoutes } from './TenantRoutes';
import { useAuth } from '@/app/providers/useAuth';
import { useMobileDrawer } from '@/shared/hooks/useMobileDrawer';
import { useSuperAdminOrganizations } from '@/features/super-admin/hooks/useSuperAdminOrganizations';
import { PublicRoutes } from './PublicRoutes';
import { SuperAdminRoutes } from './SuperAdminRoutes';

export function AppRoutes() {
  const { user, isAuthenticated, isSuperAdmin, userName, logout } = useAuth();
  const drawer = useMobileDrawer();
  const orgData = useSuperAdminOrganizations(isAuthenticated && isSuperAdmin);

  if (isInitializing) {
    return null;
  }

  if (isAuthenticated && isSuperAdmin) {
    return (
      <SuperAdminRoutes
        mobileDrawerOpen={drawer.mobileDrawerOpen}
        onOpenMobileDrawer={drawer.openMobileDrawer}
        onCloseMobileDrawer={drawer.closeMobileDrawer}
        orgData={orgData}
      />
    );
  }

  if (isAuthenticated) {
    return (
      <TenantRoutes
        user={user}
        userName={userName}
        mobileDrawerOpen={drawer.mobileDrawerOpen}
        onOpenMobileDrawer={drawer.openMobileDrawer}
        onCloseMobileDrawer={drawer.closeMobileDrawer}
        onLogout={logout}
      />
    );
  }

  return <PublicRoutes />;
}
