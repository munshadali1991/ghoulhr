import { Controller, useFormContext } from 'react-hook-form';
import { Box, MenuItem, TextField } from '@mui/material';
import { answerFieldSx } from './fieldStyles';
import { CommentField } from './CommentField';

/**
 * Left: rating dropdown. Right: justification comment. Side-by-side on desktop,
 * stacked below md. Used for KPI (Q10-36) and manager overall rating (Q43).
 * @param {{ question: object, disabled?: boolean, error?: string }} props
 */
export function RatingQuestion({ question, disabled = false, error }) {
  const { control } = useFormContext();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 320px) 1fr' },
        alignItems: 'start',
      }}
    >
      <Controller
        name={`answers.${question.key}.value`}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            select
            fullWidth
            disabled={disabled}
            error={Boolean(error)}
            helperText={error || ' '}
            sx={answerFieldSx}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="" disabled>
              Select rating
            </MenuItem>
            {(question.options ?? []).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      {question.allowComment ? (
        <CommentField questionKey={question.key} disabled={disabled} />
      ) : (
        <span />
      )}
    </Box>
  );
}
