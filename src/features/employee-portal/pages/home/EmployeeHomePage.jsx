import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { APP_NAME } from '@/app/config/appConfig';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '@/shared/components/ui/HeroBanner';
import { PageCard } from '@/shared/components/ui/PageCard';
import { AttendanceHomeWidget } from '../../components/attendance/AttendanceHomeWidget';
import { UpcomingHolidaysWidget } from '../../components/leave/UpcomingHolidaysWidget';
import { TimesheetHomeWidget } from '../../components/timesheet/TimesheetHomeWidget';
import {
  useEmployeeHome,
  useSignInAttendance,
  useSignOutAttendance,
} from '../../hooks/useEmployeePortalQueries';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { Can } from '@/features/auth/components/Can';

function PayslipRing() {
  return (
    <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto' }}>
      <CircularProgress
        variant="determinate"
        value={75}
        size={120}
        thickness={4}
        sx={{ color: 'secondary.main' }}
      />
      <CircularProgress
        variant="determinate"
        value={45}
        size={120}
        thickness={4}
        sx={{
          color: 'success.light',
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'rotate(-90deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Apr
        </Typography>
      </Box>
    </Box>
  );
}

export function EmployeeHomePage({ userName }) {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useEmployeeHome();
  const signInMutation = useSignInAttendance();
  const signOutMutation = useSignOutAttendance();
  const { snackbar, show, close } = useAppSnackbar();

  const handleAttendanceToggle = async () => {
    try {
      if (data?.attendance?.signedIn) {
        await signOutMutation.mutateAsync();
        show('Signed out successfully');
      } else {
        await signInMutation.mutateAsync();
        show('Signed in successfully');
      }
      refetch();
    } catch (e) {
      show(e?.message ?? 'Attendance action failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!data) return null;

  return (
    <>
      <HeroBanner sx={{ mb: 2 }}>
        <Grid container alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {data.greeting}, {userName}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {data.quote}
            </Typography>
          </Grid>
        </Grid>
      </HeroBanner>

      <PageCard sx={{ mb: 2, bgcolor: 'warning.light', border: 'none' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Unite by {APP_NAME}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loans and salary advances for employees.
              </Typography>
            </Box>
            <Button variant="contained" color="secondary" size="small">
              Explore
            </Button>
          </Stack>
        </CardContent>
      </PageCard>

      <Grid container spacing={2}>
        <Can permission="ess.timesheet:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <TimesheetHomeWidget timesheet={data.timesheet} />
          </Grid>
        </Can>

        <Can permission="ess.attendance:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <AttendanceHomeWidget
              attendance={data.attendance}
              onToggle={handleAttendanceToggle}
              isPending={signInMutation.isPending || signOutMutation.isPending}
            />
          </Grid>
        </Can>

        <Can permission="ess.leave:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <UpcomingHolidaysWidget holidays={data.upcomingHolidays} />
          </Grid>
        </Can>

        <Can permission="ess.leave:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <PageCard sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Quick Access
                </Typography>
                <Stack spacing={0.5}>
                  {data.quickLinks.map((link) => (
                    <Link key={link.label} href={link.href} variant="body2" underline="hover">
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </CardContent>
            </PageCard>
          </Grid>
        </Can>

        <Can permission="payroll:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <PageCard sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700}>
                  Payslip
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.payslip.month} · {data.payslip.paidDays} Paid Days
                </Typography>
                <PayslipRing />
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                  <Link component="button" variant="body2">
                    Download
                  </Link>
                  <Link component="button" variant="body2">
                    Show Salary
                  </Link>
                </Stack>
              </CardContent>
            </PageCard>
          </Grid>
        </Can>

        <Can permission="ess.leave:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <PageCard
              sx={{ height: '100%', cursor: 'pointer' }}
              onClick={() => navigate('/leave/apply?tab=pending')}
            >
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {String(data.pendingLeaveCount).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Leave pending
                </Typography>
              </CardContent>
            </PageCard>
          </Grid>
        </Can>

        <Can permission="approvals.leave:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <PageCard
              sx={{ height: '100%', cursor: 'pointer' }}
              onClick={() => navigate('/leave/requests')}
            >
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {String(data.pendingApprovalLeaveCount ?? 0).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting my approval
                </Typography>
              </CardContent>
            </PageCard>
          </Grid>
        </Can>

        <Can permission="approvals.timesheet:read">
          <Grid size={{ xs: 12, md: 4 }}>
            <PageCard
              sx={{ height: '100%', cursor: 'pointer' }}
              onClick={() => navigate('/timesheet/team?status=SUBMITTED')}
            >
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {String(data.pendingApprovalTimesheetCount ?? 0).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Timesheets awaiting approval
                </Typography>
              </CardContent>
            </PageCard>
          </Grid>
        </Can>

        <Grid size={{ xs: 12, md: 6 }}>
          <PageCard sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                IT Declaration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {data.itDeclaration.message}
              </Typography>
              <Button variant="outlined" color="secondary" size="small">
                View
              </Button>
            </CardContent>
          </PageCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PageCard sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                POI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.poi.message}
              </Typography>
            </CardContent>
          </PageCard>
        </Grid>
      </Grid>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
    </>
  );
}
