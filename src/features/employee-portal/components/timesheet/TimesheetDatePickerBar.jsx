import { IconButton, Stack } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * @param {{
 *   value: import('dayjs').Dayjs,
 *   onChange: (d: import('dayjs').Dayjs) => void,
 *   minDate?: import('dayjs').Dayjs,
 *   maxDate?: import('dayjs').Dayjs,
 * }} props
 */
export function TimesheetDatePickerBar({ value, onChange, minDate, maxDate }) {
  const goPrev = () => onChange(value.subtract(1, 'day'));
  const goNext = () => onChange(value.add(1, 'day'));
  const nextDisabled = maxDate ? value.isSame(maxDate, 'day') : false;
  const prevDisabled = minDate ? value.isSame(minDate, 'day') : false;

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <IconButton onClick={goPrev} disabled={prevDisabled} aria-label="Previous day">
        <ChevronLeftIcon />
      </IconButton>
      <DatePicker
        value={value}
        onChange={(d) => d && onChange(d)}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
      />
      <IconButton onClick={goNext} disabled={nextDisabled} aria-label="Next day">
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
