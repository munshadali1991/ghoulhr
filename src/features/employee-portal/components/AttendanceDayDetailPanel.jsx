import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PageCard } from '@/shared/components/ui/PageCard';
import { FormSectionCard } from './FormSectionCard';

/**
 * @param {{
 *   detail: import('../types/employeePortal.types').AttendanceDayDetail,
 *   loading?: boolean,
 * }} props
 */
export function AttendanceDayDetailPanel({ detail, loading }) {
  const [view, setView] = useState('grid');
  const dateLabel = dayjs(detail.date).format('DD ddd');

  if (loading) {
    return (
      <PageCard>
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      </PageCard>
    );
  }

  return (
    <PageCard sx={{ height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
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
        </Box>

        <Typography variant="h5" fontWeight={700}>
          {dateLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {detail.shiftName} Shift: {detail.shiftTime}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {detail.scheme}
        </Typography>

        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              {['First In', 'Last Out', 'Late In', 'Early Out', 'Total Work Hrs', 'Break Hrs', 'Actual Work'].map(
                (h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{detail.firstIn}</TableCell>
              <TableCell>{detail.lastOut}</TableCell>
              <TableCell>{detail.lateIn}</TableCell>
              <TableCell>{detail.earlyOut}</TableCell>
              <TableCell>{detail.totalWorkHrs}</TableCell>
              <TableCell>{detail.breakHrs}</TableCell>
              <TableCell>{detail.actualWork}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSectionCard title="Status">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Remarks
                </Typography>
                <Typography variant="body2">{detail.status}</Typography>
                <Typography variant="body2">{detail.remarks}</Typography>
              </Box>
            </FormSectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSectionCard title="Session">
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {['Session', 'Session Timing', 'First In', 'Last Out'].map((h) => (
                  <Typography key={h} variant="caption" color="text.secondary" fontWeight={600}>
                    {h}
                  </Typography>
                ))}
                {detail.sessions.length === 0 ? (
                  <Typography variant="body2" sx={{ gridColumn: '1 / -1' }} color="text.secondary">
                    No session data
                  </Typography>
                ) : (
                  detail.sessions.map((s) => (
                    <Box key={s.session} sx={{ display: 'contents' }}>
                      <Typography variant="body2">{s.session}</Typography>
                      <Typography variant="body2">{s.timing}</Typography>
                      <Typography variant="body2">{s.firstIn}</Typography>
                      <Typography variant="body2">{s.lastOut}</Typography>
                    </Box>
                  ))
                )}
              </Box>
            </FormSectionCard>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
}
