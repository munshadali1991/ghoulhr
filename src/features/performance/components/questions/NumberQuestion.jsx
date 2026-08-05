import { Controller, useFormContext } from 'react-hook-form';
import { Box, TextField } from '@mui/material';
import { answerFieldSx } from './fieldStyles';

/**
 * Numeric-only input (Q37-38). Restricts to a positive integer string.
 * @param {{ question: object, disabled?: boolean, error?: string }} props
 */
export function NumberQuestion({ question, disabled = false, error }) {
  const { control } = useFormContext();

  return (
    <Box sx={{ maxWidth: 320 }}>
      <Controller
        name={`answers.${question.key}.value`}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            onChange={(event) => {
              const next = event.target.value.replace(/[^\d]/g, '');
              field.onChange(next);
            }}
            fullWidth
            disabled={disabled}
            placeholder={question.placeholder ?? 'Enter any number'}
            error={Boolean(error)}
            helperText={error || question.helperText || ' '}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            sx={answerFieldSx}
          />
        )}
      />
    </Box>
  );
}
