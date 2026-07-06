import { Controller, useFormContext } from 'react-hook-form';
import { Box, TextField } from '@mui/material';
import { answerFieldSx } from './fieldStyles';
import { CommentField } from './CommentField';

/**
 * Full-width narrative textarea. When `question.allowComment` is set (Q7+),
 * a supplementary comment box renders side-by-side on desktop / stacked on mobile.
 * @param {{ question: object, disabled?: boolean, error?: string }} props
 */
export function NarrativeQuestion({ question, disabled = false, error }) {
  const { control } = useFormContext();

  const answer = (
    <Controller
      name={`answers.${question.key}.value`}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          fullWidth
          multiline
          minRows={2}
          disabled={disabled}
          placeholder={question.placeholder ?? 'Enter your response...'}
          error={Boolean(error)}
          helperText={error || question.helperText || ' '}
          sx={answerFieldSx}
        />
      )}
    />
  );

  if (!question.allowComment) {
    return answer;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        alignItems: 'start',
      }}
    >
      {answer}
      <CommentField questionKey={question.key} disabled={disabled} />
    </Box>
  );
}
