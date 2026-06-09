import {
  Alert,
  Box,
  Collapse,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FormSectionCard } from './FormSectionCard';
import {
  attendanceTableBodySx,
  attendanceTableHeadSx,
} from './attendance/attendanceDetailStyles';

const PERMISSION_COLUMNS = [
  'Type',
  'Applied',
  'Approved',
  'Considered',
  'From Date',
  'To Date',
  'Applied By',
  'Approved By',
];

/**
 * @param {{
 *   detail: import('../types/employeePortal.types').AttendanceDayDetail,
 *   loading?: boolean,
 *   error?: Error | null,
 * }} props
 */
export function AttendanceDayDetailPanel({ detail, loading, error }) {
  const [swipesOpen, setSwipesOpen] = useState(true);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={100} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const dateNum = dayjs(detail.date).format('DD');
  const dayLabel = detail.dayOfWeek ?? dayjs(detail.date).format('ddd');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
          <Box
            sx={{
              minWidth: 72,
              textAlign: 'center',
              pr: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h3" fontWeight={700} lineHeight={1}>
              {dateNum}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {dayLabel}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {detail.shiftName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shift : {detail.shiftTime}
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
              {detail.scheme}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {detail.schemeLabel ?? 'Attendance Scheme'}
            </Typography>
          </Box>
        </Box>

        {detail.processedAt ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 2.5, pb: 1, display: 'block' }}
          >
            Processed on {detail.processedAt}
          </Typography>
        ) : null}

        <MetricsTable
          headers={[
            'First In',
            'Last Out',
            'Late In',
            'Early Out',
            'Total Work Hrs',
            'Break Hrs',
            'Actual Work Hrs',
            'Work Hours in Shift Time',
            'Shortfall Hrs',
            'Excess Hrs',
          ]}
          values={[
            detail.firstIn,
            detail.lastOut,
            detail.lateIn,
            detail.earlyOut,
            detail.totalWorkHrs,
            detail.breakHrs,
            detail.actualWork,
            detail.workHoursInShift,
            detail.shortfallHrs,
            detail.excessHrs,
          ]}
        />

        <Box sx={{ px: 2.5, pb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={detail.progressPercent ?? 0}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'info.light' },
            }}
          />
        </Box>
      </Paper>

      <DetailTableCard
        title="Status Details"
        headers={['Status', 'Remarks']}
        rows={[[detail.status, detail.remarks]]}
      />

      <DetailTableCard
        title="Session Details"
        headers={['Session', 'Session Timing', 'First In', 'Last Out']}
        rows={
          detail.sessions.length > 0
            ? detail.sessions.map((s) => [s.session, s.timing, s.firstIn, s.lastOut])
            : [['—', '—', '—', '—']]
        }
      />

      <DetailTableCard
        title="Permission Details"
        headers={PERMISSION_COLUMNS}
        rows={[PERMISSION_COLUMNS.map(() => '—')]}
        minWidth={900}
      />

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: swipesOpen ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Swipes
          </Typography>
          <IconButton
            size="small"
            color="primary"
            onClick={() => setSwipesOpen((o) => !o)}
            aria-label={swipesOpen ? 'Collapse swipes' : 'Expand swipes'}
          >
            {swipesOpen ? (
              <KeyboardArrowUpRoundedIcon />
            ) : (
              <KeyboardArrowDownRoundedIcon />
            )}
          </IconButton>
        </Box>
        <Collapse in={swipesOpen}>
          <TableContainer>
            <Table size="small" sx={attendanceTableBodySx}>
              <TableHead sx={attendanceTableHeadSx}>
                <TableRow>
                  <TableCell>Swipe Time</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.swipes?.length > 0 ? (
                  detail.swipes.map((sw) => (
                    <TableRow key={sw.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {sw.swipeTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sw.swipeDate}
                        </Typography>
                      </TableCell>
                      <TableCell>{sw.location ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Link component="button" variant="body2" underline="hover" sx={{ cursor: 'default' }}>
                          Info
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="body2" color="text.secondary">
                        No swipes recorded for this day
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>
    </Box>
  );
}

function MetricsTable({ headers, values }) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={attendanceTableBodySx}>
        <TableHead sx={attendanceTableHeadSx}>
          <TableRow>
            {headers.map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {values.map((v, i) => (
              <TableCell key={headers[i]}>{v}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function DetailTableCard({ title, headers, rows, minWidth }) {
  return (
    <FormSectionCard title={title} flush>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ ...attendanceTableBodySx, minWidth: minWidth ?? 0 }}>
          <TableHead sx={attendanceTableHeadSx}>
            <TableRow>
              {headers.map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {row.map((cell, ci) => (
                  <TableCell key={ci}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </FormSectionCard>
  );
}
