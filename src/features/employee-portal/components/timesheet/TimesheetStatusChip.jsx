import { Chip } from '@mui/material';
import {
  STATUS_CHIP_COLOR,
  STATUS_LABELS,
  normalizeTimesheetStatus,
} from '../../constants/timesheetEnums';

/**
 * @param {{ status: string | null | undefined, size?: 'small' | 'medium' }} props
 */
export function TimesheetStatusChip({ status, size = 'small' }) {
  const key = normalizeTimesheetStatus(status);
  const label = STATUS_LABELS[key] ?? key;
  const color = STATUS_CHIP_COLOR[key] ?? 'default';

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant={key === 'PENDING' ? 'outlined' : 'filled'}
    />
  );
}
