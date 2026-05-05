import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { OrganizationFormPage } from '../pages/OrganizationFormPage';
import { OrgAdminDashboard } from '../pages/OrgAdminDashboard';
import { LoginPage } from '../pages/LoginPage';
import { SettingsPage } from '../pages/SettingsPage';

interface AppRouterProps {
  session: {
    accessToken: string;
    user: {
      role: string;
      email?: string;
      organizationId?: string;
      organizationSubdomain?: string;
    };
  } | null;
  mode: string;
  setMode: (mode: string) => void;
  form: {
    email: string;
    password: string;
  };
  onFieldChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  loading: boolean;
  error: string;
  onLogout: () => void;
  mobileDrawerOpen: boolean;
  onOpenMobileDrawer: () => void;
  onCloseMobileDrawer: () => void;
  organizations: any[];
  deletedOrganizations: any[];
  orgLoading: boolean;
  orgError: string;
  orgSearch: string;
  onOrgSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOrgDelete: (id: string) => void;
  onOrgRestore: (id: string) => void;
  onLoadOrganizations: () => void;
  stats: {
    totalOrganizations: number;
    totalUsers: number;
    totalRevenue: number;
    organizationGrowth: any[];
  };
}

export function AppRouter({
  session,
  mode,
  setMode,
  form,
  onFieldChange,
  onSubmit,
  loading,
  error,
  onLogout,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  organizations,
  deletedOrganizations,
  orgLoading,
  orgError,
  orgSearch,
  onOrgSearchChange,
  onOrgDelete,
  onOrgRestore,
  onLoadOrganizations,
  stats,
}: AppRouterProps) {
  const user = session?.user;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAuthenticated = !!session?.accessToken;

  // Super Admin Routes
  if (isAuthenticated && isSuperAdmin) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout
              user={user}
              navItems={[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Organizations', path: '/organizations' },
              ]}
              mobileDrawerOpen={mobileDrawerOpen}
              onOpenMobileDrawer={onOpenMobileDrawer}
              onCloseMobileDrawer={onCloseMobileDrawer}
              onLogout={onLogout}
            >
              <OverviewPage
                stats={stats}
                activeCount={organizations.filter((o: any) => o.status === 'ACTIVE').length}
                inactiveCount={organizations.filter((o: any) => o.status === 'INACTIVE').length}
              />
            </DashboardLayout>
          }
        />
        <Route
          path="/organizations"
          element={
            <DashboardLayout
              user={user}
              navItems={[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Organizations', path: '/organizations' },
              ]}
              mobileDrawerOpen={mobileDrawerOpen}
              onOpenMobileDrawer={onOpenMobileDrawer}
              onCloseMobileDrawer={onCloseMobileDrawer}
              onLogout={onLogout}
            >
              <OrganizationsPage
                organizations={organizations}
                deletedOrganizations={deletedOrganizations}
                isLoading={orgLoading}
                error={orgError}
                search={orgSearch}
                onSearchChange={onOrgSearchChange}
                onDelete={onOrgDelete}
                onRestore={onOrgRestore}
              />
            </DashboardLayout>
          }
        />
        <Route
          path="/organizations/new"
          element={
            <DashboardLayout
              user={user}
              navItems={[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Organizations', path: '/organizations' },
              ]}
              mobileDrawerOpen={mobileDrawerOpen}
              onOpenMobileDrawer={onOpenMobileDrawer}
              onCloseMobileDrawer={onCloseMobileDrawer}
              onLogout={onLogout}
            >
              <OrganizationFormPage
                accessToken={session?.accessToken}
                onSaved={onLoadOrganizations}
              />
            </DashboardLayout>
          }
        />
        <Route
          path="/organizations/:id/edit"
          element={
            <DashboardLayout
              user={user}
              navItems={[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Organizations', path: '/organizations' },
              ]}
              mobileDrawerOpen={mobileDrawerOpen}
              onOpenMobileDrawer={onOpenMobileDrawer}
              onCloseMobileDrawer={onCloseMobileDrawer}
              onLogout={onLogout}
            >
              <OrganizationFormPage
                accessToken={session?.accessToken}
                onSaved={onLoadOrganizations}
              />
            </DashboardLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Organization Admin Routes
  if (isAuthenticated && !isSuperAdmin) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <OrgAdminDashboard
              accessToken={session?.accessToken}
              user={user}
              userName={user?.email?.split('@')[0] || 'User'}
              mobileDrawerOpen={mobileDrawerOpen}
              onOpenMobileDrawer={onOpenMobileDrawer}
              onCloseMobileDrawer={onCloseMobileDrawer}
              onLogout={onLogout}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <OrgAdminDashboard
              accessToken={session?.accessToken}
              user={user}
              userName={user?.email?.split('@')[0] || 'User'}
              mobileDrawerOpen={mobileDrawerOpen}
              onOpenMobileDrawer={onOpenMobileDrawer}
              onCloseMobileDrawer={onCloseMobileDrawer}
              onLogout={onLogout}
              initialSection="settings"
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Public Routes (Login)
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            mode={mode}
            setMode={setMode}
            form={form}
            onFieldChange={onFieldChange}
            onSubmit={onSubmit}
            loading={loading}
            error={error}
          />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
