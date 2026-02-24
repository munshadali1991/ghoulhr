import { useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { appTheme } from './theme/appTheme';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { bootstrapSuperAdminRequest, loginRequest } from './services/authApi';
import { clearSession, persistSession, readSession } from './utils/session';
import { getTenantRedirectUrl } from './utils/tenant';

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
      persistSession(nextSession);
      setSession(nextSession);
      const redirectUrl = getTenantRedirectUrl(authResult?.user?.organizationSubdomain);
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      }
    } catch (loginError) {
      if (mode === 'superadmin' && loginError.status === 401) {
        try {
          const bootstrapResult = await bootstrapSuperAdminRequest(form.email, form.password);
          const nextSession = {
            accessToken: bootstrapResult.accessToken,
            user: bootstrapResult.user,
          };
          persistSession(nextSession);
          setSession(nextSession);
          const redirectUrl = getTenantRedirectUrl(bootstrapResult?.user?.organizationSubdomain);
          if (redirectUrl) {
            window.location.assign(redirectUrl);
          }
          setLoading(false);
          return;
        } catch (bootstrapError) {
          setError(bootstrapError.message);
          setLoading(false);
          return;
        }
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

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {session?.accessToken ? (
        <DashboardPage
          accessToken={session?.accessToken}
          user={user}
          userName={userName}
          mobileDrawerOpen={mobileDrawerOpen}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage
          mode={mode}
          setMode={setMode}
          form={form}
          onFieldChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
