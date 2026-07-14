import { Controller, useFormContext } from 'react-hook-form';
import { Box, TextField } from '@mui/material';
import { answerFieldSx } from './fieldStyles';
import { CommentField } from './CommentField';

/**
 * Short/long free-text answer used by quantitative Q39/Q40 and the role-gated
 * manager (Q42) / HR (Q49) sections. Supports an optional side-by-side comment.
 * @param {{ question: object, disabled?: boolean, error?: string }} props
 */
export function TextQuestion({ question, disabled = false, error }) {
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
