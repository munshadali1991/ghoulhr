import { Controller } from 'react-hook-form';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { shiftTimeToDayjs, dayjsToShiftTime } from '@/shared/utils/shiftTime';

/**
 * MUI X desktop time picker bound to react-hook-form (stores "HH:mm" string).
 * @param {'12' | '24'} clockFormat — 12 shows AM/PM; 24 shows 13:00-style entry.
 */
export function RhfDesktopTimePicker({ control, name, label, rules, disabled, clockFormat = '12' }) {
  const is12 = clockFormat === '12';
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <DesktopTimePicker
          label={label}
          ampm={is12}
          format={is12 ? 'hh:mm A' : 'HH:mm'}
          value={shiftTimeToDayjs(field.value)}
          onChange={(v) => field.onChange(dayjsToShiftTime(v))}
          disabled={disabled}
          minutesStep={1}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              error: !!fieldState.error,
              helperText:
                fieldState.error?.message ??
                (is12 ? '12-hour clock with AM / PM' : '24-hour clock (e.g. 14:00 = 2:00 PM)'),
              placeholder: is12 ? '9:00 AM' : '14:30',
            },
            openPickerButton: {
              'aria-label': `Open time picker: ${label}`,
            },
          }}
        />
      )}
    />
  );
}
