import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/features/super-admin/layouts/DashboardLayout';
import { OverviewPage } from '@/features/super-admin/pages/OverviewPage';
import { OrganizationsPage } from '@/features/super-admin/pages/OrganizationsPage';
import { OrganizationFormPage } from '@/features/super-admin/pages/OrganizationFormPage';
import { LeadsPage } from '@/features/super-admin/pages/LeadsPage';
import { buildSuperAdminNavItems } from '@/features/super-admin/config/superAdminNav';
import { useAuth } from '@/app/providers/useAuth';

/**
 * @param {{
 *   mobileDrawerOpen: boolean,
 *   onOpenMobileDrawer: () => void,
 *   onCloseMobileDrawer: () => void,
 *   orgData: ReturnType<typeof import('../hooks/useSuperAdminOrganizations').useSuperAdminOrganizations>,
 * }} props
 */
export function SuperAdminRoutes({
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  orgData,
}) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navItems = buildSuperAdminNavItems(pathname);

  return (
    <DashboardLayout
      user={user}
      navItems={navItems}
      mobileDrawerOpen={mobileDrawerOpen}
      onOpenMobileDrawer={onOpenMobileDrawer}
      onCloseMobileDrawer={onCloseMobileDrawer}
      onLogout={logout}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={
            <OverviewPage
              stats={orgData.stats}
              activeCount={orgData.activeCount}
              inactiveCount={orgData.inactiveCount}
            />
          }
        />
        <Route
          path="/organizations"
          element={
            <OrganizationsPage
              organizations={orgData.organizations}
              deletedOrganizations={orgData.deletedOrganizations}
              isLoading={orgData.isLoading}
              error={orgData.error}
              search={orgData.search}
              onSearchChange={(e) => orgData.setSearch(e.target.value)}
              onDelete={orgData.handleDelete}
              onRestore={orgData.handleRestore}
            />
          }
        />
        <Route
          path="/organizations/new"
          element={<OrganizationFormPage onSaved={orgData.refresh} />}
        />
        <Route
          path="/organizations/:id/edit"
          element={<OrganizationFormPage onSaved={orgData.refresh} />}
        />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
