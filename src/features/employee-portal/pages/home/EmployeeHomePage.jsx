import { Alert, Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { HomeGreetingBar } from '../../components/home/HomeGreetingBar';
import { QuickAccessCard } from '../../components/home/QuickAccessCard';
import { PayslipCard } from '../../components/home/PayslipCard';
import { ApprovalsLeaveCard } from '../../components/home/ApprovalsLeaveCard';
import { HomeNoticeCard } from '../../components/home/HomeNoticeCard';
import { TeamOnLeaveCard } from '../../components/home/TeamOnLeaveCard';
import { TrackPendingLeaveCard } from '../../components/home/TrackPendingLeaveCard';
import { WhoIsInCard } from '../../components/home/WhoIsInCard';
import { AttendanceHomeWidget } from '../../components/attendance/AttendanceHomeWidget';
import { SignInLocationDialog } from '../../components/attendance/SignInLocationDialog';
import { UpcomingHolidaysWidget } from '../../components/leave/UpcomingHolidaysWidget';
import { TimesheetHomeWidget } from '../../components/timesheet/TimesheetHomeWidget';
import {
  useEmployeeHome,
  useLeaveRequests,
  useSignInAttendance,
  useSignOutAttendance,
  useTeamOnLeave,
  useWhoIsIn,
} from '../../hooks/useEmployeePortalQueries';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { Can } from '@/features/auth/components/Can';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

const ROW1 = `"ts ts ts ts ts sh sh sh sh hd hd hd"`;
const ROW2 = `"qa qa qa ps ps ps lv lv lv hd hd hd"`;

function desktopAreas({ showTeam, showTrack, showWhoIsIn }) {
  const mid = [];
  if (showTeam) mid.push('tol');
  if (showTrack) mid.push('trk');
  if (showWhoIsIn) mid.push('wii');

  const rows = [`${ROW1}`, `${ROW2}`];

  if (mid.length === 0) {
    rows.push('"n1 n1 n1 n1 n1 n1 n2 n2 n2 n2 n2 n2"');
  } else if (mid.length === 1) {
    const a = mid[0];
    rows.push(
      `"${a} ${a} ${a} ${a} ${a} ${a} n1 n1 n1 n1 n1 n1"`,
      '"n2 n2 n2 n2 n2 n2 n2 n2 n2 n2 n2 n2"',
    );
  } else if (mid.length === 2) {
    const [a, b] = mid;
    rows.push(
      `"${a} ${a} ${a} ${a} ${a} ${a} ${b} ${b} ${b} ${b} ${b} ${b}"`,
      '"n1 n1 n1 n1 n1 n1 n2 n2 n2 n2 n2 n2"',
    );
  } else {
    const [a, b, c] = mid;
    rows.push(
      `"${a} ${a} ${a} ${a} ${b} ${b} ${b} ${b} ${c} ${c} ${c} ${c}"`,
      '"n1 n1 n1 n1 n1 n1 n2 n2 n2 n2 n2 n2"',
    );
  }

  return `\n${rows.join('\n')}\n`;
}

function mobileAreas({ showTeam, showTrack, showWhoIsIn }) {
  const lines = ['"ts"', '"sh"', '"hd"', '"qa"', '"ps"', '"lv"'];
  if (showTeam) lines.push('"tol"');
  if (showTrack) lines.push('"trk"');
  if (showWhoIsIn) lines.push('"wii"');
  lines.push('"n1"', '"n2"');
  return `\n${lines.join('\n')}\n`;
}

export function EmployeeHomePage({ userName }) {
  const { can } = useAuthorization();
  const { data, isLoading, error, refetch } = useEmployeeHome();
  const canTeamOnLeave = can('dashboard.ess.team-on-leave:read');
  const canTrack = can('dashboard.ess.track:read');
  const canWhoIsIn = can('dashboard.ess.who-is-in:read');
  const teamOnLeaveQuery = useTeamOnLeave(canTeamOnLeave);
  const pendingLeaveQuery = useLeaveRequests('PENDING', canTrack);
  const whoIsInQuery = useWhoIsIn(undefined, canWhoIsIn);
  const signInMutation = useSignInAttendance();
  const signOutMutation = useSignOutAttendance();
  const { snackbar, show, close } = useAppSnackbar();
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);

  const handleAttendanceToggle = async () => {
    if (data?.attendance?.signedIn) {
      try {
        await signOutMutation.mutateAsync();
        show('Signed out successfully');
        refetch();
      } catch (e) {
        show(e?.message ?? 'Attendance action failed', 'error');
      }
      return;
    }
    setSignInDialogOpen(true);
  };

  const handleSignInConfirm = async (signInLocation) => {
    try {
      await signInMutation.mutateAsync(signInLocation);
      setSignInDialogOpen(false);
      show('Signed in successfully');
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

  const flags = {
    showTeam: canTeamOnLeave,
    showTrack: canTrack,
    showWhoIsIn: canWhoIsIn,
  };

  return (
    <>
      <HomeGreetingBar greeting={data.greeting} userName={userName} />

      <Box
        sx={{
          display: 'grid',
          gap: 2.25,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
          gridTemplateAreas: {
            xs: mobileAreas(flags),
            md: desktopAreas(flags),
          },
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

        {flags.showTeam ? (
          <Box sx={{ gridArea: 'tol', minWidth: 0 }}>
            <TeamOnLeaveCard
              data={teamOnLeaveQuery.data}
              isLoading={teamOnLeaveQuery.isLoading}
              error={teamOnLeaveQuery.error}
            />
          </Box>
        ) : null}

        {flags.showTrack ? (
          <Box sx={{ gridArea: 'trk', minWidth: 0 }}>
            <TrackPendingLeaveCard
              requests={pendingLeaveQuery.data ?? []}
              isLoading={pendingLeaveQuery.isLoading}
              error={pendingLeaveQuery.error}
            />
          </Box>
        ) : null}

        {flags.showWhoIsIn ? (
          <Box sx={{ gridArea: 'wii', minWidth: 0 }}>
            <WhoIsInCard
              data={whoIsInQuery.data}
              isLoading={whoIsInQuery.isLoading}
              error={whoIsInQuery.error}
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

      <SignInLocationDialog
        open={signInDialogOpen}
        onClose={() => setSignInDialogOpen(false)}
        onConfirm={handleSignInConfirm}
        isPending={signInMutation.isPending}
      />
    </>
  );
}
