import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { useTeamOnLeaveChart } from '../../hooks/useEmployeePortalQueries';
import { downloadTeamOnLeaveChartCsv } from '../../api/employeePortalApi';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { orgNow } from '../../utils/orgDayjs';
import { formatDaysCount, formatEmployeeCode } from '../../utils/displayFormat';

const SERIES_COLORS = [
  '#7EB6FF',
  '#5CBDBA',
  '#F6A96B',
  '#A78BFA',
  '#F472B6',
  '#34D399',
];

function durationRange(preset, timezone) {
  const now = timezone ? orgNow(timezone) : dayjs();
  if (preset === 'week') {
    return {
      from: now.startOf('week').format('YYYY-MM-DD'),
      to: now.endOf('week').format('YYYY-MM-DD'),
    };
  }
  if (preset === 'lastMonth') {
    const last = now.subtract(1, 'month');
    return {
      from: last.startOf('month').format('YYYY-MM-DD'),
      to: last.endOf('month').format('YYYY-MM-DD'),
    };
  }
  return {
    from: now.startOf('month').format('YYYY-MM-DD'),
    to: now.endOf('month').format('YYYY-MM-DD'),
  };
}

function formatRangeLabel(from, to) {
  return `${dayjs(from).format('DD MMM YYYY')} TO ${dayjs(to).format('DD MMM YYYY')}`;
}

/**
 * Leave → Team On Leave chart / list screen.
 */
export function TeamOnLeavePage() {
  const { can } = useAuthorization();
  const allowed = can('dashboard.ess.team-on-leave:read');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { snackbar, show, close } = useAppSnackbar();

  const [duration, setDuration] = useState('thisMonth');
  const [type, setType] = useState('all');
  const [view, setView] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [orgTimezone, setOrgTimezone] = useState(null);
  const syncedTz = useRef(false);

  const range = useMemo(
    () => durationRange(duration, orgTimezone),
    [duration, orgTimezone],
  );
  const queryParams = useMemo(
    () => ({ from: range.from, to: range.to, type }),
    [range.from, range.to, type],
  );

  const query = useTeamOnLeaveChart(queryParams, allowed);
  const data = query.data;

  useEffect(() => {
    if (!data?.timezone || syncedTz.current) return;
    setOrgTimezone(data.timezone);
    syncedTz.current = true;
  }, [data?.timezone]);

  const series = data?.series ?? [];
  const points = data?.points ?? [];
  const chartData = useMemo(
    () =>
      points.map((p) => ({
        date: p.date,
        label: p.label,
        ...p.values,
      })),
    [points],
  );

  const breakdown = selectedDate
    ? data?.breakdownByDate?.[selectedDate]
    : null;

  const colorByKey = useMemo(() => {
    const map = {};
    series.forEach((s, i) => {
      map[s.key] =
        s.kind === 'holiday'
          ? '#5CBDBA'
          : SERIES_COLORS[i % SERIES_COLORS.length];
    });
    return map;
  }, [series]);

  const handleBarClick = (state) => {
    const date = state?.activePayload?.[0]?.payload?.date;
    if (!date) return;
    setSelectedDate(date);
    if (isMobile) setMobileDrawerOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadTeamOnLeaveChartCsv(queryParams);
      show('CSV downloaded');
    } catch (e) {
      show(e?.message ?? 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!allowed) {
    return (
      <Alert severity="warning">You do not have access to Team On Leave.</Alert>
    );
  }

  const breakdownPanel = (
    <PageCard
      sx={{
        height: '100%',
        minHeight: 280,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!selectedDate || !breakdown ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Click on the graph to see the breakdown.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2} sx={{ overflow: 'auto' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {dayjs(selectedDate).format('DD MMM YYYY')}
          </Typography>
          {(breakdown.leave ?? []).length === 0 &&
          (breakdown.holiday ?? []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No one in this category
            </Typography>
          ) : (
            <>
              {(breakdown.leave ?? []).map((row) => (
                <Box
                  key={`${row.employeeId}-${row.leaveType}-${row.from}`}
                  sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      m: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={row.name || undefined}
                  >
                    {row.name || 'Employee'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {[formatEmployeeCode(row.employeeCode), row.leaveType]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {row.from === row.to
                      ? dayjs(row.from).format('DD MMM YYYY')
                      : `${dayjs(row.from).format('DD MMM')} – ${dayjs(row.to).format('DD MMM YYYY')}`}{' '}
                    · {formatDaysCount(row.days)}
                  </Typography>
                </Box>
              ))}
              {(breakdown.holiday ?? []).map((row) => (
                <Box
                  key={`${row.employeeId}-h-${row.holidayName}`}
                  sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      m: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={row.name || undefined}
                  >
                    {row.name || 'Employee'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {[formatEmployeeCode(row.employeeCode), row.holidayName]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Restricted Holiday
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </Stack>
      )}
    </PageCard>
  );

  return (
    <Box>
      <PageToolbar
        left={
          <Typography variant="h5" fontWeight={700} sx={{ m: 0 }}>
            Team On Leave
          </Typography>
        }
        right={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton
              aria-label="Download CSV"
              onClick={handleExport}
              disabled={exporting || query.isLoading}
              color="primary"
            >
              <DownloadRoundedIcon />
            </IconButton>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_, v) => v && setView(v)}
            >
              <ToggleButton value="grid" aria-label="Grid view">
                <GridViewRoundedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="List view">
                <ViewListRoundedIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ sm: 'center' }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="tol-duration">Duration</InputLabel>
          <Select
            labelId="tol-duration"
            label="Duration"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              setSelectedDate(null);
            }}
          >
            <MenuItem value="thisMonth">This Month</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="tol-type">Type</InputLabel>
          <Select
            labelId="tol-type"
            label="Type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSelectedDate(null);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="leave">Leave</MenuItem>
            <MenuItem value="holiday">Holiday</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : view === 'list' ? (
        <PageCard sx={{ p: 0, overflow: 'hidden', minHeight: 280 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell align="right">Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.listRows ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 3, textAlign: 'center' }}
                      >
                        No team leave in this range
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.listRows ?? []).map((row, idx) => {
                    const codeLabel = formatEmployeeCode(row.employeeCode);
                    return (
                    <TableRow key={`${row.date}-${row.employeeId}-${row.typeLabel}-${idx}`}>
                      <TableCell>{dayjs(row.date).format('DD MMM YYYY')}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            m: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={row.name || undefined}
                        >
                          {row.name || 'Employee'}
                        </Typography>
                        {codeLabel ? (
                          <Typography variant="caption" color="text.secondary">
                            {codeLabel}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>{row.typeLabel || '—'}</TableCell>
                      <TableCell>
                        {row.from === row.to
                          ? dayjs(row.from).format('DD MMM YYYY')
                          : `${dayjs(row.from).format('DD MMM')} – ${dayjs(row.to).format('DD MMM YYYY')}`}
                      </TableCell>
                      <TableCell align="right">{formatDaysCount(row.days, { unit: false })}</TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </PageCard>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 280px' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <PageCard sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Duration Selected :{' '}
              <Typography component="span" fontWeight={700} variant="body2" color="text.primary">
                {formatRangeLabel(range.from, range.to)}
              </Typography>
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: { xs: 320, md: 400 },
                position: 'relative',
              }}
            >
              {series.length === 0 || chartData.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No leave or holiday data in this range
                  </Typography>
                </Box>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  onClick={handleBarClick}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis
                    label={{
                      value: 'People on leave',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 12 },
                    }}
                    allowDecimals
                  />
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 12 }} />
                  {series.map((s) => (
                    <Bar
                      key={s.key}
                      dataKey={s.key}
                      name={s.label}
                      stackId="tol"
                      fill={colorByKey[s.key]}
                      radius={[2, 2, 0, 0]}
                      cursor="pointer"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              )}
            </Box>
          </PageCard>

          {!isMobile ? <Box sx={{ minWidth: 0 }}>{breakdownPanel}</Box> : null}
        </Box>
      )}

      <Drawer
        anchor="bottom"
        open={isMobile && mobileDrawerOpen && view === 'grid'}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: { maxHeight: '70vh', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        }}
      >
        <Box sx={{ p: 1 }}>{breakdownPanel}</Box>
      </Drawer>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Box>
  );
}
