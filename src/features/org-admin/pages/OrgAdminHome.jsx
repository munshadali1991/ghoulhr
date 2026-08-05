import { Alert, Box, Button } from '@mui/material';
import { HrDashboardGreetingBar } from '../components/dashboard/HrDashboardGreetingBar';
import { HrDashboardKpiStrip } from '../components/dashboard/HrDashboardKpiStrip';
import { HrDashboardShortcuts } from '../components/dashboard/HrDashboardShortcuts';
import { HrDashboardActivity } from '../components/dashboard/HrDashboardActivity';
import { useHrDashboard } from '../hooks/useHrDashboard';

/**
 * @param {{ user: object, userName: string }} props
 */
export function OrgAdminHome({ user, userName }) {
  const { data, isLoading, error, refetch } = useHrDashboard();
  const stats = data?.stats ?? {};
  const recentActivity = data?.recentActivity ?? [];

  return (
    <>
      <HrDashboardGreetingBar
        userName={userName}
        organizationSubdomain={user?.organizationSubdomain}
      />

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : null}

      <HrDashboardKpiStrip stats={stats} isLoading={isLoading} />

      <Box
        sx={{
          display: 'grid',
          gap: 2.25,
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <HrDashboardShortcuts />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <HrDashboardActivity items={recentActivity} isLoading={isLoading} />
        </Box>
      </Box>
    </>
  );
}
