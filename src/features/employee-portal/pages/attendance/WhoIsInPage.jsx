import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { useWhoIsIn } from '../../hooks/useEmployeePortalQueries';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { orgTodayKey } from '../../utils/orgDayjs';
import {
  formatDaysCount,
  formatEmployeeCode,
  leaveStatusChipProps,
} from '../../utils/displayFormat';

const MAX_RANGE_DAYS = 31;

const OOO_TABS = [
  { key: 'onLeave', label: 'On Leave' },
  { key: 'holiday', label: 'Holiday' },
  { key: 'offDay', label: 'Off Day' },
  { key: 'restDay', label: 'Rest Day' },
];

function daysInRange(from, to) {
  const start = dayjs(from);
  const end = dayjs(to);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return [];
  const out = [];
  let cur = start;
  while (!cur.isAfter(end)) {
    out.push(cur.format('YYYY-MM-DD'));
    cur = cur.add(1, 'day');
    if (out.length > MAX_RANGE_DAYS) break;
  }
  return out;
}

function EmptyColumn({ message }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        textAlign: 'center',
        color: 'text.disabled',
      }}
    >
      <DescriptionOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
      <Typography variant="body2" color="text.disabled">
        {message}
      </Typography>
    </Box>
  );
}

function PersonRow({ person, subtitle, children }) {
  const [open, setOpen] = useState(false);
  const codeLabel = formatEmployeeCode(person?.employeeCode);
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{
          py: 1.25,
          px: 1.5,
          cursor: children ? 'pointer' : 'default',
        }}
        onClick={() => children && setOpen((v) => !v)}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              m: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={person?.name || undefined}
          >
            {person?.name || 'Employee'}
          </Typography>
          {codeLabel ? (
            <Typography variant="caption" color="text.disabled">
              {codeLabel}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {children ? (
          <IconButton
            size="small"
            sx={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: '0.2s',
              flexShrink: 0,
            }}
          >
            <ExpandMoreRoundedIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Stack>
      {children ? <Collapse in={open}>{children}</Collapse> : null}
    </Box>
  );
}

function DetailGrid({ rows }) {
  return (
    <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
      {rows.map((r) => (
        <Stack
          key={r.label}
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ py: 0.4 }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {r.label}
          </Typography>
          {r.href ? (
            <Link
              href={r.href}
              variant="caption"
              underline="hover"
              sx={{
                minWidth: 0,
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {r.value || '—'}
            </Link>
          ) : (
            <Typography
              variant="caption"
              color="text.primary"
              textAlign="right"
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={r.value || undefined}
            >
              {r.value || '—'}
            </Typography>
          )}
        </Stack>
      ))}
    </Box>
  );
}

function BucketColumn({ title, count, emptyMessage, children }) {
  return (
    <PageCard
      sx={{
        height: '100%',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', m: 0 }}
      >
        {title}
        {typeof count === 'number' ? ` (${count})` : ''}
      </Typography>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {count === 0 ? <EmptyColumn message={emptyMessage} /> : children}
      </Box>
    </PageCard>
  );
}

/**
 * Attendance → Who is in (scoped roster for a selected day in a from–to range).
 */
export function WhoIsInPage() {
  const { can } = useAuthorization();
  const allowed = can('dashboard.ess.who-is-in:read');

  const [orgTimezone, setOrgTimezone] = useState(null);
  const syncedTz = useRef(false);
  const today = orgTimezone ? orgTodayKey(orgTimezone) : dayjs().format('YYYY-MM-DD');
  const [from, setFrom] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [to, setTo] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [oooTab, setOooTab] = useState('onLeave');

  const rangeDays = useMemo(() => daysInRange(from, to), [from, to]);
  const rangeError =
    dayjs(to).diff(dayjs(from), 'day') + 1 > MAX_RANGE_DAYS
      ? `Range cannot exceed ${MAX_RANGE_DAYS} days`
      : dayjs(to).isBefore(dayjs(from))
        ? 'To date must be on or after From date'
        : null;

  useEffect(() => {
    if (rangeError || rangeDays.length === 0) return;
    if (!rangeDays.includes(selectedDate)) {
      const preferred = rangeDays.includes(today) ? today : rangeDays[rangeDays.length - 1];
      setSelectedDate(preferred);
    }
  }, [rangeDays, rangeError, selectedDate, today]);

  const query = useWhoIsIn(selectedDate, allowed && !rangeError && Boolean(selectedDate));
  const data = query.data;

  useEffect(() => {
    if (!data?.timezone || syncedTz.current) return;
    setOrgTimezone(data.timezone);
    const orgToday = orgTodayKey(data.timezone);
    const browserToday = dayjs().format('YYYY-MM-DD');
    if (from === browserToday && to === browserToday) {
      setFrom(orgToday);
      setTo(orgToday);
      setSelectedDate(orgToday);
    }
    syncedTz.current = true;
  }, [data?.timezone, from, to]);

  if (!allowed) {
    return <Alert severity="warning">You do not have access to Who is in.</Alert>;
  }

  const summary = data?.summary;
  const ooo = data?.outOfOffice ?? {};
  const oooList = ooo[oooTab] ?? [];

  return (
    <Box>
      <PageToolbar
        title={`Employees Information for ${dayjs(selectedDate).format('DD MMM YYYY')}`}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <TextField
          label="From"
          type="date"
          size="small"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {rangeError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rangeError}
        </Alert>
      ) : null}

      {!rangeError && rangeDays.length > 1 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {rangeDays.map((d) => (
            <Chip
              key={d}
              size="small"
              label={dayjs(d).format('DD MMM')}
              color={d === selectedDate ? 'secondary' : 'default'}
              variant={d === selectedDate ? 'filled' : 'outlined'}
              onClick={() => setSelectedDate(d)}
            />
          ))}
        </Stack>
      ) : null}

      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 1,
              mb: 2.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
            }}
          >
            {[
              {
                pct: summary?.percentNotYetIn ?? 0,
                label: 'Not Yet In',
                count: summary?.notYetIn ?? 0,
              },
              {
                pct: summary?.percentLate ?? 0,
                label: 'Late In',
                count: summary?.late ?? 0,
              },
              {
                pct: summary?.percentOnTime ?? 0,
                label: 'On-Time',
                count: summary?.onTime ?? 0,
              },
              {
                pct: summary?.percentOutOfOffice ?? 0,
                label: 'Out of Office',
                count: summary?.outOfOffice ?? 0,
              },
            ].map((cell) => (
              <Box
                key={cell.label}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRight: { md: 1 },
                  borderBottom: { xs: 1, md: 0 },
                  borderColor: 'divider',
                  '&:last-of-type': { borderRight: 0, borderBottom: 0 },
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ m: 0 }}>
                  {cell.pct}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cell.count} Employee(s) Are {cell.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            <BucketColumn
              title="Not Yet In"
              count={data?.notYetIn?.length ?? 0}
              emptyMessage="Awesome, everyone's in!"
            >
              {(data?.notYetIn ?? []).map((p) => (
                <PersonRow
                  key={p.employeeId}
                  person={p}
                >
                  <DetailGrid
                    rows={[
                      { label: 'Shift Name', value: p.shiftName },
                      { label: 'Shift Time', value: p.shiftTime },
                      {
                        label: 'Mail Address',
                        value: p.email,
                        href: p.email ? `mailto:${p.email}` : undefined,
                      },
                      { label: 'Phone Number', value: p.phone },
                      { label: 'Designation', value: p.designation },
                      { label: 'Location', value: p.location },
                    ]}
                  />
                </PersonRow>
              ))}
            </BucketColumn>

            <BucketColumn
              title="Late Arrivals"
              count={data?.lateArrivals?.length ?? 0}
              emptyMessage="Team's on the way"
            >
              {(data?.lateArrivals ?? []).map((p) => (
                <PersonRow
                  key={p.employeeId}
                  person={p}
                  subtitle={
                    p.firstIn
                      ? `In ${p.firstIn} · Late ${p.lateInMinutes}m`
                      : undefined
                  }
                >
                  <DetailGrid
                    rows={[
                      { label: 'Shift Name', value: p.shiftName },
                      { label: 'Shift Time', value: p.shiftTime },
                      {
                        label: 'Mail Address',
                        value: p.email,
                        href: p.email ? `mailto:${p.email}` : undefined,
                      },
                      { label: 'Phone Number', value: p.phone },
                      { label: 'Designation', value: p.designation },
                      { label: 'Location', value: p.location },
                    ]}
                  />
                </PersonRow>
              ))}
            </BucketColumn>

            <BucketColumn
              title="On Time"
              count={data?.onTime?.length ?? 0}
              emptyMessage="No one on time yet"
            >
              {(data?.onTime ?? []).map((p) => (
                <PersonRow
                  key={p.employeeId}
                  person={p}
                  subtitle={p.firstIn ? `In ${p.firstIn}` : undefined}
                >
                  <DetailGrid
                    rows={[
                      { label: 'Shift Name', value: p.shiftName },
                      { label: 'Shift Time', value: p.shiftTime },
                      {
                        label: 'Mail Address',
                        value: p.email,
                        href: p.email ? `mailto:${p.email}` : undefined,
                      },
                      { label: 'Phone Number', value: p.phone },
                      { label: 'Designation', value: p.designation },
                      { label: 'Location', value: p.location },
                    ]}
                  />
                </PersonRow>
              ))}
            </BucketColumn>

            <PageCard
              sx={{
                height: '100%',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                p: 0,
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', m: 0 }}
              >
                Out of Office ({summary?.outOfOffice ?? 0})
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
                sx={{ px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}
              >
                {OOO_TABS.map((tab) => {
                  const count = (ooo[tab.key] ?? []).length;
                  return (
                    <Chip
                      key={tab.key}
                      size="small"
                      label={`${tab.label} (${count})`}
                      color={oooTab === tab.key ? 'secondary' : 'default'}
                      variant={oooTab === tab.key ? 'filled' : 'outlined'}
                      onClick={() => setOooTab(tab.key)}
                    />
                  );
                })}
              </Stack>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {oooList.length === 0 ? (
                  <EmptyColumn message="No one in this category" />
                ) : (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        px: 1.5,
                        py: 1,
                        bgcolor: (t) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.08)'
                            : 'rgba(59, 130, 246, 0.06)',
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        Employee
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        Number Of Days
                      </Typography>
                    </Stack>
                    {oooList.map((p) => {
                      const statusChip = leaveStatusChipProps(p.status);
                      return (
                      <PersonRow
                        key={p.employeeId}
                        person={p}
                        subtitle={
                          oooTab === 'onLeave'
                            ? formatDaysCount(p.daysCount)
                            : undefined
                        }
                      >
                        {oooTab === 'onLeave' ? (
                          <Box sx={{ px: 1.5, pb: 1.5 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={1}
                              sx={{ mb: 1 }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  minWidth: 0,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={p.leaveDates || undefined}
                              >
                                {p.leaveDates || '—'}
                              </Typography>
                              <Chip
                                size="small"
                                label={statusChip.label}
                                color={statusChip.color}
                                variant="outlined"
                                sx={{ height: 22, flexShrink: 0 }}
                              />
                            </Stack>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={p.leaveType || undefined}
                            >
                              {p.leaveType || '—'}
                            </Typography>
                            <DetailGrid
                              rows={[
                                { label: 'Shift Name', value: p.shiftName },
                                { label: 'Shift Time', value: p.shiftTime },
                                {
                                  label: 'Mail Address',
                                  value: p.email,
                                  href: p.email ? `mailto:${p.email}` : undefined,
                                },
                                { label: 'Phone Number', value: p.phone },
                                { label: 'Designation', value: p.designation },
                                { label: 'Location', value: p.location },
                              ]}
                            />
                          </Box>
                        ) : (
                          <DetailGrid
                            rows={[
                              { label: 'Shift Name', value: p.shiftName },
                              { label: 'Shift Time', value: p.shiftTime },
                              {
                                label: 'Mail Address',
                                value: p.email,
                                href: p.email ? `mailto:${p.email}` : undefined,
                              },
                              { label: 'Phone Number', value: p.phone },
                              { label: 'Designation', value: p.designation },
                              { label: 'Location', value: p.location },
                            ]}
                          />
                        )}
                      </PersonRow>
                      );
                    })}
                  </>
                )}
              </Box>
            </PageCard>
          </Box>
        </>
      )}
    </Box>
  );
}
