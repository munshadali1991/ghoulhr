import { Stack, Typography } from '@mui/material';
import { TimesheetStatusChip } from './TimesheetStatusChip';

/**
 * @param {{
 *   totalHours: number,
 *   maxHours: number,
 *   status: string | null,
 * }} props
 */
export function TimesheetDayHeader({ totalHours, maxHours, status }) {
  const overLimit = totalHours > maxHours;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="flex-end"
    >
      <TimesheetStatusChip status={status} />
      <Typography
        variant="subtitle1"
        fontWeight={700}
        color={overLimit ? 'error.main' : 'text.primary'}
      >
        Total: {totalHours.toFixed(1)}h / {maxHours}h max
      </Typography>
    </Stack>
  );
}
