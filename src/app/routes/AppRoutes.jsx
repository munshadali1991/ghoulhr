import { EmployeeRoutes } from '@/features/employee-portal/routes/EmployeeRoutes';
import { OrgAdminRoutes } from './OrgAdminRoutes';
import { useAuth } from '@/app/providers/useAuth';
import { useMobileDrawer } from '@/shared/hooks/useMobileDrawer';
import { useSuperAdminOrganizations } from '@/features/super-admin/hooks/useSuperAdminOrganizations';
import { PublicRoutes } from './PublicRoutes';
import { SuperAdminRoutes } from './SuperAdminRoutes';

export function AppRoutes() {
  const { user, isAuthenticated, isSuperAdmin, isEmployee, userName, logout } = useAuth();
  const drawer = useMobileDrawer();
  const orgData = useSuperAdminOrganizations(isAuthenticated && isSuperAdmin);

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

  if (isAuthenticated && isEmployee) {
    return (
      <EmployeeRoutes
        user={user}
        userName={userName}
        mobileDrawerOpen={drawer.mobileDrawerOpen}
        onOpenMobileDrawer={drawer.openMobileDrawer}
        onCloseMobileDrawer={drawer.closeMobileDrawer}
        onLogout={logout}
      />
    );
  }

  if (isAuthenticated) {
    return (
      <OrgAdminRoutes
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
