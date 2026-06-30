import { Grid, Paper, Stack, Typography } from '@mui/material';
import { TimesheetStatusChip } from './TimesheetStatusChip';

const SUMMARY_ORDER = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'];

/**
 * @param {{
 *   totalHours: number,
 *   statusSummary: Record<string, number>,
 *   submittedCount?: number,
 * }} props
 */
export function TimesheetSummaryCards({ totalHours, statusSummary, submittedCount = 0 }) {
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
      <Grid size={{ xs: 12, sm: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            borderColor: submittedCount > 0 ? 'info.main' : 'divider',
            bgcolor: submittedCount > 0 ? 'info.50' : 'background.paper',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Awaiting approval
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            color={submittedCount > 0 ? 'info.dark' : 'text.primary'}
          >
            {submittedCount}
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Status summary
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {SUMMARY_ORDER.map((status) => {
              const count = statusSummary[status] ?? 0;
              if (count === 0) return null;
              return (
                <Stack key={status} direction="row" alignItems="center" spacing={0.5}>
                  <TimesheetStatusChip status={status} />
                  <Typography variant="caption">×{count}</Typography>
                </Stack>
              );
            })}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
