import { useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { appTheme } from './theme/appTheme';
import { LoginPage } from './pages/LoginPage';
import { bootstrapSuperAdminRequest, loginRequest } from './services/authApi';
import { clearSession, persistSession, readSession } from './utils/session';
import { getTenantRedirectUrl } from './utils/tenant';
import { DashboardLayout } from './layouts/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { OrganizationFormPage } from './pages/OrganizationFormPage';
import {
  listDeletedOrganizations,
  listOrganizations,
  getSuperAdminDashboardStats,
  deleteOrganization,
  restoreOrganization,
} from './services/organizationsApi';

function App() {
  const [session, setSession] = useState(() => readSession());
  const [mode, setMode] = useState('superadmin');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const user = session?.user;
  const userName = useMemo(() => user?.email?.split('@')[0] || 'User', [user?.email]);
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
      const authResult = await loginRequest(form.email, form.password);

      if (!authResult?.accessToken) {
        throw new Error('Login failed. Invalid response from server.');
      }

      const nextSession = {
        accessToken: authResult.accessToken,
        user: authResult.user,
      };
      
      // Save session first
      persistSession(nextSession);
      setSession(nextSession);
      
      // Get redirect URL with session data for cross-subdomain transfer
      const redirectUrl = getTenantRedirectUrl(authResult?.user?.organizationSubdomain, nextSession);
      
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        setLoading(false);
      }
    } catch (loginError) {
      if (mode === 'superadmin' && loginError.status === 401) {
        try {
          const bootstrapResult = await bootstrapSuperAdminRequest(form.email, form.password);
          const nextSession = {
            accessToken: bootstrapResult.accessToken,
            user: bootstrapResult.user,
          };
          
          // Save session first
          persistSession(nextSession);
          setSession(nextSession);
          
          // Get redirect URL with session data for cross-subdomain transfer
          const redirectUrl = getTenantRedirectUrl(bootstrapResult?.user?.organizationSubdomain, nextSession);
          
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

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const loadOrganizationsAndStats = async () => {
    if (!session?.accessToken || user?.role !== 'SUPER_ADMIN') {
      setOrgLoading(false);
      return;
    }
    setOrgError('');
    setOrgLoading(true);
    try {
      const [orgs, deleted, statsResponse] = await Promise.all([
        listOrganizations(session.accessToken),
        listDeletedOrganizations(session.accessToken),
        getSuperAdminDashboardStats(session.accessToken),
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
    if (session?.accessToken && user?.role === 'SUPER_ADMIN') {
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
  }, [session?.accessToken, user?.role]);

  const handleOrgDelete = async (id) => {
    if (!session?.accessToken) return;
    setOrgError('');
    try {
      await deleteOrganization(session.accessToken, id);
      await loadOrganizationsAndStats();
    } catch (err) {
      setOrgError(err.message);
    }
  };

  const handleOrgRestore = async (id) => {
    if (!session?.accessToken) return;
    setOrgError('');
    try {
      await restoreOrganization(session.accessToken, id);
      await loadOrganizationsAndStats();
    } catch (err) {
      setOrgError(err.message);
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        {session?.accessToken ? (
          <DashboardLayout
            user={user}
            navItems={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Organizations', path: '/organizations' },
            ]}
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
                    accessToken={session?.accessToken}
                    onSaved={loadOrganizationsAndStats}
                  />
                }
              />
              <Route
                path="/organizations/:id/edit"
                element={
                  <OrganizationFormPage
                    accessToken={session?.accessToken}
                    onSaved={loadOrganizationsAndStats}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
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
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
