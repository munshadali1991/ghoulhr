import { Alert, Box, CircularProgress } from '@mui/material';
import { HomeGreetingBar } from '../../components/home/HomeGreetingBar';
import { QuickAccessCard } from '../../components/home/QuickAccessCard';
import { PayslipCard } from '../../components/home/PayslipCard';
import { ApprovalsLeaveCard } from '../../components/home/ApprovalsLeaveCard';
import { HomeNoticeCard } from '../../components/home/HomeNoticeCard';
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
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

const GRID_DESKTOP = `
  "ts ts ts ts ts sh sh sh sh hd hd hd"
  "qa qa qa ps ps ps lv lv lv hd hd hd"
  "n1 n1 n1 n1 n1 n1 n2 n2 n2 n2 n2 n2"
`;

const GRID_MOBILE = `
  "ts"
  "sh"
  "hd"
  "qa"
  "ps"
  "lv"
  "n1"
  "n2"
`;

export function EmployeeHomePage({ userName }) {
  const { can } = useAuthorization();
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

  const showApprovals =
    can('ess.leave:read') || can('approvals.leave:read') || can('approvals.timesheet:read');

  return (
    <>
      <HomeGreetingBar greeting={data.greeting} userName={userName} />

      <Box
        sx={{
          display: 'grid',
          gap: 2.25,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
          gridTemplateAreas: { xs: GRID_MOBILE, md: GRID_DESKTOP },
          alignItems: 'stretch',
        }}
      >
        <Can permission="ess.timesheet:read">
          <Box sx={{ gridArea: 'ts', minWidth: 0 }}>
            <TimesheetHomeWidget timesheet={data.timesheet} />
          </Box>
        </Can>

        <Can permission="ess.attendance:read">
          <Box sx={{ gridArea: 'sh', minWidth: 0 }}>
            <AttendanceHomeWidget
              attendance={data.attendance}
              onToggle={handleAttendanceToggle}
              isPending={signInMutation.isPending || signOutMutation.isPending}
            />
          </Box>
        </Can>

        <Can permission="ess.leave:read">
          <Box sx={{ gridArea: 'hd', minWidth: 0, minHeight: { md: 0 } }}>
            <UpcomingHolidaysWidget holidays={data.upcomingHolidays} />
          </Box>
        </Can>

        <Can permission="ess.leave:read">
          <Box sx={{ gridArea: 'qa', minWidth: 0 }}>
            <QuickAccessCard links={data.quickLinks} />
          </Box>
        </Can>

        <Can permission="payroll:read">
          <Box sx={{ gridArea: 'ps', minWidth: 0 }}>
            <PayslipCard payslip={data.payslip} />
          </Box>
        </Can>

        {showApprovals ? (
          <Box sx={{ gridArea: 'lv', minWidth: 0 }}>
            <ApprovalsLeaveCard
              pendingLeaveCount={data.pendingLeaveCount}
              pendingApprovalLeaveCount={data.pendingApprovalLeaveCount}
              pendingApprovalTimesheetCount={data.pendingApprovalTimesheetCount}
            />
          </Box>
        ) : null}

        <Box sx={{ gridArea: 'n1', minWidth: 0 }}>
          <HomeNoticeCard
            tone="success"
            title="IT declaration"
            message={data.itDeclaration?.message}
            actionLabel="View"
          />
        </Box>

        <Box sx={{ gridArea: 'n2', minWidth: 0 }}>
          <HomeNoticeCard
            tone="warning"
            title="Proof of investments"
            message={data.poi?.message}
          />
        </Box>
      </Box>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
    </>
  );
}
