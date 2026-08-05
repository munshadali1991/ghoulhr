import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { TenantRoutes } from './TenantRoutes';
import { useAuth } from '@/app/providers/useAuth';
import { useMobileDrawer } from '@/shared/hooks/useMobileDrawer';
import { useSuperAdminOrganizations } from '@/features/super-admin/hooks/useSuperAdminOrganizations';
import { PublicRoutes } from './PublicRoutes';
import { SuperAdminRoutes } from './SuperAdminRoutes';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import { RequirePasswordChanged } from '@/features/auth/components/RequirePasswordChanged';

export function AppRoutes() {
  const { user, isAuthenticated, isSuperAdmin, isInitializing, userName, logout } = useAuth();
  const drawer = useMobileDrawer();
  const orgData = useSuperAdminOrganizations(isAuthenticated && isSuperAdmin);

  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
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
    if (user?.mustChangePassword) {
      return (
        <Routes>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="*" element={<Navigate to="/change-password" replace />} />
        </Routes>
      );
    }

    return (
      <RequirePasswordChanged>
        <TenantRoutes
          user={user}
          userName={userName}
          mobileDrawerOpen={drawer.mobileDrawerOpen}
          onOpenMobileDrawer={drawer.openMobileDrawer}
          onCloseMobileDrawer={drawer.closeMobileDrawer}
          onLogout={logout}
        />
      </RequirePasswordChanged>
    );
  }

  return <PublicRoutes />;
}
