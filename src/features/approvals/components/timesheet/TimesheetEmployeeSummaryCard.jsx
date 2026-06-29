import { Box, Paper, Stack, Typography } from '@mui/material';
import { TimesheetStatusChip } from '@/features/employee-portal/components/timesheet/TimesheetStatusChip';

const SUMMARY_ORDER = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'];

/**
 * @param {{
 *   employee: { id: string, name: string, employeeCode?: string },
 *   totalDays: number,
 *   totalHours: number,
 *   pendingCount: number,
 *   statusSummary: Record<string, number>,
 * }} props
 */
export function TimesheetEmployeeSummaryCard({
  employee,
  totalDays,
  totalHours,
  pendingCount,
  statusSummary,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {employee.name}
          </Typography>
          {employee.employeeCode ? (
            <Typography variant="caption" color="text.secondary">
              {employee.employeeCode}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
          <Stat label="Days" value={String(totalDays)} />
          <Stat label="Hours" value={`${totalHours.toFixed(1)}h`} />
          <Stat label="Not submitted" value={String(pendingCount)} highlight={pendingCount > 0} />
        </Stack>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
        {SUMMARY_ORDER.map((st) => {
          const count = statusSummary[st] ?? 0;
          if (count === 0) return null;
          return (
            <Stack key={st} direction="row" alignItems="center" spacing={0.5}>
              <TimesheetStatusChip status={st} />
              <Typography variant="caption">×{count}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

/**
 * @param {{ label: string, value: string, highlight?: boolean }} props
 */
function Stat({ label, value, highlight }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={700} color={highlight ? 'warning.main' : 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );
}
