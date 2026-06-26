import { Box, Grid, Link, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * @param {{
 *   summary: import('../types/employeePortal.types').AttendanceSummary,
 * }} props
 */
export function AttendanceMetricsRow({ summary }) {
  return (
    <Box sx={{ mb: 2 }}>
      {summary.exceptionDays > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
            py: 1.25,
            mb: 2,
            borderRadius: 1,
            bgcolor: 'error.light',
            color: 'error.dark',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberRoundedIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {summary.exceptionDays} exception day(s)
            </Typography>
          </Box>
          <Link component="button" variant="body2" underline="hover" color="secondary">
            Regularize
          </Link>
        </Box>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard label="AVG. WORK HRS" value={summary.avgWorkHrs} sub={summary.avgWorkHrsTrend} negative />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            label="AVG. ACTUAL WORK HRS"
            value={summary.avgActualWorkHrs}
            sub={summary.avgActualWorkHrsTrend}
            negative
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard label="PENALTY DAYS" value={String(summary.penaltyDays)} />
        </Grid>
      </Grid>

      {summary.insightsCount > 0 ? (
        <Link component="button" variant="body2" color="secondary" sx={{ mt: 1, display: 'inline-block' }}>
          +{summary.insightsCount} INSIGHTS
        </Link>
      ) : null}
    </Box>
  );
}

/**
 * @param {{ label: string, value: string, sub?: string, negative?: boolean }} props
 */
function MetricCard({ label, value, sub, negative }) {
  return (
    <PageCard>
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        {sub ? (
          <Typography variant="caption" color={negative ? 'error.main' : 'text.secondary'}>
            {sub}
          </Typography>
        ) : null}
      </Box>
    </PageCard>
  );
}
