import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { MonthCalendarGrid } from '../../components/MonthCalendarGrid';
import { toDateKey } from '../../utils/calendarUtils';
import { EmptyStatePanel } from '../../components/EmptyStatePanel';
import { LeaveTransactionList } from '../../components/LeaveTransactionList';
import { useLeaveCalendar, useLeaveTransactions } from '../../hooks/useEmployeePortalQueries';

export function LeaveCalendarPage() {
  const [month, setMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [filter, setFilter] = useState('me');
  const [search, setSearch] = useState('');

  const year = month.year();
  const monthNum = month.month() + 1;
  const dateKey = toDateKey(selectedDate);

  const calendarQuery = useLeaveCalendar(year, monthNum, filter);
  const transactionsQuery = useLeaveTransactions(dateKey, filter, search);

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
        if (!marker?.holiday && !marker?.onLeave) return null;

        return (
          <Stack direction="row" spacing={0.25} justifyContent="center" sx={{ mt: 0.25 }}>
            {marker.onLeave ? (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            ) : null}
            {marker.holiday ? (
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
    [calendarQuery.data?.days],
  );

  return (
    <>
      <PageToolbar
        left={
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select label="Filter Type" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="me">Me</MenuItem>
              <MenuItem value="team">My Team</MenuItem>
            </Select>
          </FormControl>
        }
      />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <PageCard sx={{ flex: 2, p: 2 }}>
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

        <PageCard sx={{ flex: 1, minWidth: { xs: 0, lg: 280 }, width: '100%' }}>
          <Box sx={{ p: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search Employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: <SearchRoundedIcon fontSize="small" color="action" />,
                },
              }}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Leave Transactions ({transactionsQuery.data?.items?.length ?? 0})
            </Typography>
            {transactionsQuery.isLoading ? (
              <CircularProgress size={24} />
            ) : transactionsQuery.data?.items?.length === 0 ? (
              <EmptyStatePanel title="No Employees are on leave" />
            ) : (
              <LeaveTransactionList items={transactionsQuery.data.items} />
            )}
          </Box>
        </PageCard>
      </Stack>
    </>
  );
}
