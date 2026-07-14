import { Grid, Paper, Typography } from '@mui/material';

/**
 * @param {{
 *   totalHours: number,
 *   submittedCount?: number,
 * }} props
 */
export function TimesheetSummaryCards({ totalHours, submittedCount = 0 }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total hours
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {totalHours.toFixed(1)}h
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Submitted timesheets
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {submittedCount}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
