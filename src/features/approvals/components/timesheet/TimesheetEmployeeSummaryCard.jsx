import { Box, Paper, Stack, Typography } from '@mui/material';

/**
 * @param {{
 *   employee: { id: string, name: string, employeeCode?: string },
 *   totalDays: number,
 *   totalHours: number,
 *   submittedCount?: number,
 * }} props
 */
export function TimesheetEmployeeSummaryCard({
  employee,
  totalDays,
  totalHours,
  submittedCount = 0,
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
          <Stat label="Submitted" value={String(submittedCount)} />
        </Stack>
      </Stack>
    </Paper>
  );
}

/**
 * @param {{ label: string, value: string }} props
 */
function Stat({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={700} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}
