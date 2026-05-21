import { MenuItem, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LeaveFormRow } from './LeaveFormRow';

/**
 * @param {{
 *   control: import('react-hook-form').Control<{ leaves: unknown[] }>,
 *   name: string,
 *   label: string,
 *   required?: boolean,
 *   hint?: string,
 *   options: { value: string, label: string }[],
 *   rules?: import('react-hook-form').RegisterOptions,
 *   fieldError?: string,
 * }} props
 */
export function LeaveSelectFormRow({
  control,
  name,
  label,
  required,
  hint,
  options,
  rules,
  fieldError,
}) {
  return (
    <LeaveFormRow label={label} required={required} hint={hint}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <TextField
            fullWidth
            select
            size="small"
            hiddenLabel
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={!!fieldState.error || !!fieldError}
            helperText={fieldState.error?.message || fieldError}
            inputProps={{ 'aria-label': label }}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </LeaveFormRow>
  );
}
