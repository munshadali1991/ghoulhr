import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { MonthCalendarGrid } from '../../components/MonthCalendarGrid';
import { toDateKey } from '../../utils/calendarUtils';
import { EmptyStatePanel } from '../../components/EmptyStatePanel';
import { useLeaveCalendar, useLeaveTransactions } from '../../hooks/useEmployeePortalQueries';

export function LeaveCalendarPage() {
  const [month, setMonth] = useState(dayjs('2026-05-01'));
  const [selectedDate, setSelectedDate] = useState(dayjs('2026-05-20'));
  const [filter, setFilter] = useState('me');
  const [search, setSearch] = useState('');

  const year = month.year();
  const monthNum = month.month() + 1;
  const dateKey = toDateKey(selectedDate);

  const calendarQuery = useLeaveCalendar(year, monthNum, filter);
  const transactionsQuery = useLeaveTransactions(dateKey, filter, search);

  const legend = (
    <Stack direction="row" spacing={3} flexWrap="wrap" alignItems="center">
      <Typography variant="caption" color="text.secondary">
        Team on Leave <strong>0</strong>
      </Typography>
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
        if (!marker?.holiday) return null;
        return (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: marker.holiday === 'restricted' ? 'warning.main' : 'secondary.main',
              mx: 'auto',
              mt: 0.25,
            }}
          />
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
        right={
          <Button variant="contained" color="secondary" startIcon={<DownloadRoundedIcon />}>
            Download
          </Button>
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

        <PageCard sx={{ flex: 1, minWidth: 280 }}>
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
              <Box component="table" sx={{ width: '100%', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th align="left">Employee</th>
                    <th align="left">Days</th>
                    <th align="left">From-To</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsQuery.data.items.map((t) => (
                    <tr key={`${t.employeeName}-${t.from}`}>
                      <td>{t.employeeName}</td>
                      <td>{t.days}</td>
                      <td>
                        {t.from} – {t.to}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            )}
          </Box>
        </PageCard>
      </Stack>
    </>
  );
}
