import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { MonthCalendarGrid } from '../../components/MonthCalendarGrid';
import { toDateKey } from '../../utils/calendarUtils';
import { LeaveTransactionList } from '../../components/LeaveTransactionList';
import { LeaveCalendarHolidaysList } from '../../components/LeaveCalendarHolidaysList';
import { useLeaveCalendar, useLeaveTransactions } from '../../hooks/useEmployeePortalQueries';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { orgNow } from '../../utils/orgDayjs';

function initialLeaveFilter(searchParams, canTeam) {
  if (!canTeam) return 'me';
  return searchParams.get('filter') === 'team' ? 'team' : 'me';
}

export function LeaveCalendarPage() {
  const { can } = useAuthorization();
  const canTeam = can('dashboard.ess.team-on-leave:read');
  const [searchParams] = useSearchParams();
  const [month, setMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [filter, setFilter] = useState(() =>
    initialLeaveFilter(searchParams, canTeam),
  );
  const [search, setSearch] = useState('');
  const [orgTimezone, setOrgTimezone] = useState(null);

  useEffect(() => {
    if (!canTeam && filter === 'team') setFilter('me');
  }, [canTeam, filter]);

  useEffect(() => {
    if (!orgTimezone) return;
    const now = orgNow(orgTimezone);
    const browserToday = dayjs().format('YYYY-MM-DD');
    setSelectedDate((prev) =>
      prev.format('YYYY-MM-DD') === browserToday ? now : prev,
    );
    setMonth((prev) => {
      const browserMonth = dayjs().startOf('month');
      return prev.isSame(browserMonth, 'month') ? now.startOf('month') : prev;
    });
  }, [orgTimezone]);

  const year = month.year();
  const monthNum = month.month() + 1;
  const dateKey = toDateKey(selectedDate);

  const calendarQuery = useLeaveCalendar(year, monthNum, filter);
  const transactionsQuery = useLeaveTransactions(dateKey, filter, search);

  useEffect(() => {
    if (calendarQuery.data?.timezone) {
      setOrgTimezone(calendarQuery.data.timezone);
    }
  }, [calendarQuery.data?.timezone]);

  const teamOnLeaveCount = calendarQuery.data?.teamOnLeaveCount ?? 0;

  const legend = (
    <Stack direction="row" spacing={3} flexWrap="wrap" alignItems="center">
      {filter === 'team' ? (
        <Typography variant="caption" color="text.secondary">
          Team on Leave <strong>{teamOnLeaveCount}</strong>
        </Typography>
      ) : null}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
        <Typography variant="caption">On Leave</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
        <Typography variant="caption">Restricted Holiday</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
        <Typography variant="caption">General Holiday</Typography>
      </Stack>
    </Stack>
  );

  const renderCell = useMemo(
    () =>
      ({ date }) => {
        const key = toDateKey(date);
        const marker = calendarQuery.data?.days?.[key];
        const count = Number(marker?.onLeaveCount ?? 0);
        const showTeamBadge = filter === 'team' && count > 0;
        const showMeDot = filter === 'me' && marker?.onLeave;
        if (!marker?.holiday && !showTeamBadge && !showMeDot) return null;

        return (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 0.25, minHeight: 18 }}
          >
            {showTeamBadge ? (
              <Box
                sx={{
                  minWidth: 18,
                  height: 18,
                  px: 0.5,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  typography: 'caption',
                  fontWeight: 600,
                  fontSize: 11,
                  lineHeight: 1,
                }}
              >
                {count}
              </Box>
            ) : null}
            {showMeDot ? (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            ) : null}
            {marker?.holiday ? (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor:
                    marker.holiday === 'restricted' ? 'warning.main' : 'secondary.main',
                }}
              />
            ) : null}
          </Stack>
        );
      },
    [calendarQuery.data?.days, filter],
  );

  return (
    <>
      <PageToolbar
        left={
          canTeam ? (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                label="Filter Type"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="me">Me</MenuItem>
                <MenuItem value="team">My Team</MenuItem>
              </Select>
            </FormControl>
          ) : null
        }
      />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <PageCard sx={{ flex: 2, p: 2, minHeight: 360 }}>
          {calendarQuery.isLoading ? (
            <CircularProgress size={32} />
          ) : calendarQuery.error ? (
            <Alert severity="error">{calendarQuery.error.message}</Alert>
          ) : (
            <MonthCalendarGrid
              month={month}
              selectedDate={selectedDate}
              onMonthChange={setMonth}
              onDateSelect={setSelectedDate}
              renderCell={renderCell}
              legend={legend}
            />
          )}
        </PageCard>

        <PageCard sx={{ flex: 1, minWidth: { xs: 0, lg: 320 }, width: '100%', minHeight: 280 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ m: 0, mb: 0.25 }}>
              {selectedDate.format('DD ddd')}
            </Typography>
            {(transactionsQuery.data?.holidays?.length ?? 0) > 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {transactionsQuery.data.holidays[0].holidayType}
                {transactionsQuery.data.holidays[0].name
                  ? ` · ${transactionsQuery.data.holidays[0].name}`
                  : ''}
              </Typography>
            ) : (
              <Box sx={{ mb: 1.5 }} />
            )}

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search Employee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <IconButton size="small" aria-label="Filter" disabled>
                <FilterListRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            {transactionsQuery.isLoading ? (
              <CircularProgress size={24} />
            ) : transactionsQuery.error ? (
              <Alert severity="error">{transactionsQuery.error.message}</Alert>
            ) : (
              <>
                <LeaveTransactionList
                  items={transactionsQuery.data?.items ?? []}
                />
                <LeaveCalendarHolidaysList
                  holidays={transactionsQuery.data?.holidays ?? []}
                />
              </>
            )}
          </Box>
        </PageCard>
      </Stack>
    </>
  );
}
