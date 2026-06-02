import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageCard } from '@/shared/components/ui/PageCard';
import { HeroBanner } from '@/shared/components/ui/HeroBanner';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { TimesheetSummaryCards } from '../../components/timesheet/TimesheetSummaryCards';
import { TimesheetStatusChip } from '../../components/timesheet/TimesheetStatusChip';
import { useTimesheetReports } from '../../hooks/useEmployeePortalQueries';

const TAB_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function getRange(tab, anchor) {
  if (tab === 'daily') {
    const start = anchor.startOf('week');
    const end = anchor.endOf('week');
    return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD'), anchor: start };
  }
  if (tab === 'weekly') {
    const start = anchor.startOf('month').startOf('week');
    const end = anchor.endOf('month').endOf('week');
    return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD'), anchor };
  }
  const start = anchor.startOf('year');
  const end = anchor.endOf('year');
  return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD'), anchor };
}

export function TimesheetReportsPage() {
  const [tab, setTab] = useState('daily');
  const [anchor, setAnchor] = useState(() => dayjs());

  const range = useMemo(() => getRange(tab, anchor), [tab, anchor]);
  const { data, isLoading, error } = useTimesheetReports({
    granularity: tab,
    from: range.from,
    to: range.to,
  });

  const shiftAnchor = (dir) => {
    if (tab === 'daily') setAnchor((a) => a.add(dir, 'week'));
    else if (tab === 'weekly') setAnchor((a) => a.add(dir, 'month'));
    else setAnchor((a) => a.add(dir, 'year'));
  };

  const chartData = (data?.series ?? []).map((s) => ({
    label: tab === 'monthly' ? s.label : dayjs(s.label).format(tab === 'weekly' ? 'DD MMM' : 'ddd'),
    hours: s.totalHours,
  }));

  return (
    <>
      <HeroBanner sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          My Reports
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Review logged hours across daily, weekly, and monthly views.
        </Typography>
      </HeroBanner>

      <SegmentedTabs value={tab} options={TAB_OPTIONS} onChange={setTab} sx={{ mb: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => shiftAnchor(-1)} aria-label="Previous period">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
          {range.from} — {range.to}
        </Typography>
        <IconButton onClick={() => shiftAnchor(1)} aria-label="Next period">
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {error ? <Alert severity="error">{error.message}</Alert> : null}

      {data ? (
        <>
          <TimesheetSummaryCards
            totalHours={data.totalHours}
            statusSummary={data.statusSummary}
          />

          <PageCard sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Hours overview
            </Typography>
            {chartData.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No timesheet data in this period.
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="var(--mui-palette-primary-main)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </PageCard>

          <PageCard>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Day breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.days ?? []).map((row) => (
                    <TableRow key={row.workDate} hover>
                      <TableCell>{dayjs(row.workDate).format('DD MMM YYYY')}</TableCell>
                      <TableCell align="right">{row.totalHours.toFixed(1)}</TableCell>
                      <TableCell>
                        <TimesheetStatusChip status={row.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Link
                          component={RouterLink}
                          to={`/timesheet?date=${row.workDate}`}
                          underline="hover"
                        >
                          Open
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PageCard>
        </>
      ) : null}
    </>
  );
}
