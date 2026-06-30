import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar, ToolbarButtonGroup } from '../../components/PageToolbar';
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
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

const STATUS_BG = {
  P: 'success.light',
  A: 'warning.light',
  R: 'background.paper',
};

const EMPTY_DETAIL = {
  date: '',
  dayOfWeek: '',
  shiftName: '—',
  shiftTime: '—',
  scheme: '—',
  schemeLabel: 'Attendance Scheme',
  firstIn: '-',
  lastOut: '-',
  lateIn: '-',
  earlyOut: '-',
  totalWorkHrs: '-',
  breakHrs: '-',
  actualWork: '-',
  workHoursInShift: '-',
  shortfallHrs: '-',
  excessHrs: '-',
  progressPercent: 0,
  processedAt: null,
  status: '-',
  remarks: '-',
  sessions: [],
  permissions: [],
  swipes: [],
};

export function AttendanceInfoPage() {
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canPunch = can('ess.attendance:punch');
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

  const handleDateSelect = (date) => {
    const key = toDateKey(date);
    const marker = days[key];
    if (marker?.status === 'A') {
      navigate(`/leave/apply?tab=apply&fromDate=${key}&toDate=${key}`);
      return;
    }
    setSelectedDate(date);
  };

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
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
              lineHeight: 1.2,
            }}
          >
            {marker.status}
          </Typography>
        ) : null}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={0.25}
        >
          {marker.hasBreak ? (
            <LocalCafeRoundedIcon sx={{ fontSize: { xs: 10, sm: 12 }, opacity: 0.5 }} />
          ) : (
            <span />
          )}
          {marker.shiftCode ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.55rem', sm: '0.65rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {marker.shiftCode}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    );
  };

  const detailData = detailQuery.data ?? { ...EMPTY_DETAIL, date: dateKey, dayOfWeek: selectedDate.format('ddd') };

  return (
    <>
      <PageToolbar
        right={
          <ToolbarButtonGroup>
            <Button variant="outlined" color="secondary" size="small">
              My Regularizations
            </Button>
            {canPunch ? (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled={signInMutation.isPending || signOutMutation.isPending}
              onClick={handleAttendanceToggle}
            >
              {signedIn ? 'Sign Out' : 'Sign In'}
            </Button>
            ) : null}
          </ToolbarButtonGroup>
        }
      />

      {summaryQuery.isLoading ? (
        <CircularProgress size={32} />
      ) : summaryQuery.error ? (
        <Alert severity="error">{summaryQuery.error.message}</Alert>
      ) : summaryQuery.data ? (
        <AttendanceMetricsRow summary={summaryQuery.data} />
      ) : null}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <PageCard sx={{ flex: { lg: 2 }, width: '100%', p: { xs: 1.5, sm: 2 } }}>
          {daysQuery.isLoading ? (
            <CircularProgress size={32} />
          ) : daysQuery.error ? (
            <Alert severity="error">{daysQuery.error.message}</Alert>
          ) : (
            <MonthCalendarGrid
              month={month}
              selectedDate={selectedDate}
              onMonthChange={setMonth}
              onDateSelect={handleDateSelect}
              renderCell={renderCell}
            />
          )}
        </PageCard>

        <Box
          sx={{
            flex: { lg: 1 },
            width: '100%',
            minWidth: { lg: 320 },
            position: { lg: 'sticky' },
            top: { lg: 16 },
            alignSelf: { lg: 'flex-start' },
          }}
        >
          <AttendanceDayDetailPanel
            detail={detailData}
            loading={detailQuery.isLoading}
            error={detailQuery.error}
          />
        </Box>
      </Stack>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
    </>
  );
}
