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
} from '../../hooks/useEmployeePortalQueries';

const STATUS_BG = {
  P: 'success.light',
  A: 'warning.light',
  R: 'background.paper',
};

export function AttendanceInfoPage() {
  const [month, setMonth] = useState(dayjs('2026-05-01'));
  const [selectedDate, setSelectedDate] = useState(dayjs('2026-05-20'));

  const year = month.year();
  const monthNum = month.month() + 1;
  const dateKey = toDateKey(selectedDate);

  const summaryQuery = useAttendanceSummary(year, monthNum);
  const daysQuery = useAttendanceDays(year, monthNum);
  const detailQuery = useAttendanceDayDetail(dateKey);

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
          <Button variant="contained" color="secondary" size="small">
            My Regularizations
          </Button>
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
    </>
  );
}
