import { useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appTheme } from './theme/appTheme';
import { LoginPage } from './pages/LoginPage';
import {
  bootstrapSuperAdminRequest,
  loginRequest,
  employeeLoginRequest,
  fetchSessionUser,
  logoutRequest,
} from './services/authApi';
import { clearSession, readSession } from './utils/session';
import { getTenantRedirectUrl } from './utils/tenant';
import { DashboardLayout } from './layouts/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { OrgDashboardPage } from './pages/OrgDashboardPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { OrganizationFormPage } from './pages/OrganizationFormPage';
import {
  listDeletedOrganizations,
  listOrganizations,
  getSuperAdminDashboardStats,
  deleteOrganization,
  restoreOrganization,
} from './services/organizationsApi';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [session, setSession] = useState(() => readSession());
  const [mode, setMode] = useState('admin');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const user = session?.user;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  // Employee roles from tenant auth system
  const isEmployee = ['EMPLOYEE', 'MANAGER', 'ORG_ADMIN'].includes(user?.role) && user?.employeeCode;
  const userName = useMemo(() => user?.name || user?.email?.split('@')[0] || 'User', [user?.email, user?.name]);
  const [organizations, setOrganizations] = useState([]);
  const [deletedOrganizations, setDeletedOrganizations] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalRevenue: 0,
    organizationGrowth: [],
  });
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState('');
  const [orgSearch, setOrgSearch] = useState('');

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      let authResult;
      
      // Handle employee/manager login (tenant database)
      if (mode === 'employee') {
        // Employee/Manager login - searches across all organizations
        authResult = await employeeLoginRequest(form.email, form.password);
      } else {
        // Admin login (SUPER_ADMIN + ORG_ADMIN) - master database
        authResult = await loginRequest(form.email, form.password);
      }

      if (!authResult?.user) {
        throw new Error('Login failed. Invalid response from server.');
      }
      setSession({ user: authResult.user });
      
      const shouldRedirectToTenant = authResult?.user?.role !== 'SUPER_ADMIN';
      const redirectUrl = shouldRedirectToTenant
        ? getTenantRedirectUrl(authResult?.user?.organizationSubdomain)
        : null;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        setLoading(false);
      }
    } catch (loginError) {
      // Handle super admin bootstrap fallback only for admin mode
      if (mode === 'admin' && loginError.status === 401) {
        try {
          const bootstrapResult = await bootstrapSuperAdminRequest(form.email, form.password);
          setSession({ user: bootstrapResult.user });
          
          const shouldRedirectToTenant = bootstrapResult?.user?.role !== 'SUPER_ADMIN';
          const redirectUrl = shouldRedirectToTenant
            ? getTenantRedirectUrl(bootstrapResult?.user?.organizationSubdomain)
            : null;

          if (redirectUrl) {
            window.location.assign(redirectUrl);
          } else {
            setLoading(false);
          }
          return;
        } catch (bootstrapError) {
          setError(bootstrapError.message);
        }
        return;
      }

      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutRequest();
    clearSession();
    setSession(null);
  };

  const loadOrganizationsAndStats = async () => {
    if (!session?.user || user?.role !== 'SUPER_ADMIN') {
      setOrgLoading(false);
      return;
    }
    setOrgError('');
    setOrgLoading(true);
    try {
      const [orgs, deleted, statsResponse] = await Promise.all([
        listOrganizations(),
        listDeletedOrganizations(),
        getSuperAdminDashboardStats(),
      ]);
      setOrganizations(Array.isArray(orgs) ? orgs : []);
      setDeletedOrganizations(Array.isArray(deleted) ? deleted : []);
      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (err) {
      setOrgError(err.message);
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    // Load dashboard data whenever a SUPER_ADMIN logs in or token changes
    if (session?.user && user?.role === 'SUPER_ADMIN') {
      loadOrganizationsAndStats();
    } else {
      setOrganizations([]);
      setDeletedOrganizations([]);
      setStats({
        totalOrganizations: 0,
        totalUsers: 0,
        totalRevenue: 0,
        organizationGrowth: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, user?.role]);

  const handleOrgDelete = async (id) => {
    setOrgError('');
    try {
      await deleteOrganization(id);
      await loadOrganizationsAndStats();
    } catch (err) {
      setOrgError(err.message);
    }
  };

  const handleOrgRestore = async (id) => {
    setOrgError('');
    try {
      await restoreOrganization(id);
      await loadOrganizationsAndStats();
    } catch (err) {
      setOrgError(err.message);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchSessionUser()
      .then((userData) => {
        if (mounted && userData) {
          setSession({ user: userData });
        }
      })
      .catch(() => {
        if (mounted) setSession(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {session?.user && isSuperAdmin ? (
          <DashboardLayout
            user={user}
            navItems={
              [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Organizations', path: '/organizations' },
              ]
            }
            mobileDrawerOpen={mobileDrawerOpen}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
            onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            onLogout={handleLogout}
          >
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <OverviewPage
                    stats={stats}
                    activeCount={organizations.filter((o) => o.status === 'ACTIVE').length}
                    inactiveCount={organizations.filter((o) => o.status === 'INACTIVE').length}
                  />
                }
              />
              <Route
                path="/organizations"
                element={
                  <OrganizationsPage
                    organizations={organizations}
                    deletedOrganizations={deletedOrganizations}
                    isLoading={orgLoading}
                    error={orgError}
                    search={orgSearch}
                    onSearchChange={(e) => setOrgSearch(e.target.value)}
                    onDelete={handleOrgDelete}
                    onRestore={handleOrgRestore}
                  />
                }
              />
              <Route
                path="/organizations/new"
                element={
                  <OrganizationFormPage
                    onSaved={loadOrganizationsAndStats}
                  />
                }
              />
              <Route
                path="/organizations/:id/edit"
                element={
                  <OrganizationFormPage
                    onSaved={loadOrganizationsAndStats}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        ) : session?.user && isEmployee ? (
          // Employee Dashboard
          <EmployeeDashboard
            user={user}
            userName={userName}
            mobileDrawerOpen={mobileDrawerOpen}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
            onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            onLogout={handleLogout}
          />
        ) : session?.user ? (
          // Org Admin Dashboard (non-employee system users)
          <OrgDashboardPage
            user={user}
            userName={userName}
            mobileDrawerOpen={mobileDrawerOpen}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
            onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            onLogout={handleLogout}
          />
        ) : (
          <Routes>
            <Route
              path="/login"
              element={
                <LoginPage
                  mode={mode}
                  setMode={setMode}
                  form={form}
                  onFieldChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
