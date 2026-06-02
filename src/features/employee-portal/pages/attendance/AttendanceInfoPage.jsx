import { Alert, Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { MonthCalendarGrid } from '../../components/MonthCalendarGrid';
import { toDateKey } from '../../utils/calendarUtils';
import { AttendanceMetricsRow } from '../../components/AttendanceMetricsRow';
import { AttendanceDayDetailPanel } from '../../components/AttendanceDayDetailPanel';
import {
  useAttendanceDayDetail,
  useAttendanceDays,
  useAttendanceSummary,
  useEmployeeHome,
  useSignInAttendance,
  useSignOutAttendance,
} from '../../hooks/useEmployeePortalQueries';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';

const STATUS_BG = {
  P: 'success.light',
  A: 'warning.light',
  R: 'background.paper',
};

export function AttendanceInfoPage() {
  const [month, setMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const { data: homeData, refetch: refetchHome } = useEmployeeHome();
  const signInMutation = useSignInAttendance();
  const signOutMutation = useSignOutAttendance();
  const { snackbar, show, close } = useAppSnackbar();

  const year = month.year();
  const monthNum = month.month() + 1;
  const dateKey = toDateKey(selectedDate);

  const summaryQuery = useAttendanceSummary(year, monthNum);
  const daysQuery = useAttendanceDays(year, monthNum);
  const detailQuery = useAttendanceDayDetail(dateKey);

  const signedIn = homeData?.attendance?.signedIn ?? false;

  const handleAttendanceToggle = async () => {
    try {
      if (signedIn) {
        await signOutMutation.mutateAsync();
        show('Signed out successfully');
      } else {
        await signInMutation.mutateAsync();
        show('Signed in successfully');
      }
      await Promise.all([
        refetchHome(),
        summaryQuery.refetch(),
        daysQuery.refetch(),
        detailQuery.refetch(),
      ]);
    } catch (e) {
      show(e?.message ?? 'Attendance action failed', 'error');
    }
  };

  const days = daysQuery.data?.days ?? {};

  const renderCell = ({ date }) => {
    const key = toDateKey(date);
    const marker = days[key];
    if (!marker) return null;
    return (
      <Box sx={{ mt: 0.25 }}>
        {marker.status ? (
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              display: 'block',
              textAlign: 'center',
              bgcolor: STATUS_BG[marker.status] ?? 'transparent',
              borderRadius: 0.5,
            }}
          >
            {marker.status}
          </Typography>
        ) : null}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {marker.hasBreak ? <LocalCafeRoundedIcon sx={{ fontSize: 12, opacity: 0.5 }} /> : <span />}
          {marker.shiftCode ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {marker.shiftCode}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    );
  };

  return (
    <>
      <PageToolbar
        right={
          <>
            <Button variant="outlined" color="secondary" size="small">
              My Regularizations
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled={signInMutation.isPending || signOutMutation.isPending}
              onClick={handleAttendanceToggle}
            >
              {signedIn ? 'Sign Out' : 'Sign In'}
            </Button>
          </>
        }
      />

      {summaryQuery.isLoading ? (
        <CircularProgress size={32} />
      ) : summaryQuery.error ? (
        <Alert severity="error">{summaryQuery.error.message}</Alert>
      ) : summaryQuery.data ? (
        <AttendanceMetricsRow summary={summaryQuery.data} />
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <PageCard sx={{ p: 2 }}>
            {daysQuery.isLoading ? (
              <CircularProgress size={32} />
            ) : daysQuery.error ? (
              <Alert severity="error">{daysQuery.error.message}</Alert>
            ) : (
              <MonthCalendarGrid
                month={month}
                selectedDate={selectedDate}
                onMonthChange={setMonth}
                onDateSelect={setSelectedDate}
                renderCell={renderCell}
              />
            )}
          </PageCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <AttendanceDayDetailPanel
            detail={detailQuery.data ?? { date: dateKey, shiftName: '—', shiftTime: '—', scheme: '—', firstIn: '-', lastOut: '-', lateIn: '-', earlyOut: '-', totalWorkHrs: '-', breakHrs: '-', actualWork: '-', status: '-', remarks: '-', sessions: [] }}
            loading={detailQuery.isLoading}
          />
        </Grid>
      </Grid>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
    </>
  );
}
