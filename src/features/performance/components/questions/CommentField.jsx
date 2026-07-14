import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '@mui/material';
import { commentFieldSx } from './fieldStyles';

/**
 * Supplementary comment textarea shown beside answer fields (Q7+, KPI, Q40).
 * @param {{ questionKey: string, disabled?: boolean, placeholder?: string }} props
 */
export function CommentField({ questionKey, disabled = false, placeholder = 'Enter your comment' }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={`answers.${questionKey}.comment`}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          fullWidth
          multiline
          minRows={2}
          disabled={disabled}
          placeholder={placeholder}
          sx={commentFieldSx}
        />
      )}
    />
  );
}
