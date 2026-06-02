import { Grid, Paper, Stack, Typography } from '@mui/material';
import { TimesheetStatusChip } from './TimesheetStatusChip';

/**
 * @param {{ totalHours: number, statusSummary: Record<string, number> }} props
 */
export function TimesheetSummaryCards({ totalHours, statusSummary }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total hours
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {totalHours.toFixed(1)}h
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Status summary
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {Object.entries(statusSummary).map(([status, count]) => (
              <Stack key={status} direction="row" alignItems="center" spacing={0.5}>
                <TimesheetStatusChip status={status === 'MISSING' ? null : status} />
                <Typography variant="caption">×{count}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
