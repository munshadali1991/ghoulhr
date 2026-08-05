import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from '@mui/material';
import { CommentField } from './CommentField';

/**
 * Single-choice radio group from question.options.
 * @param {{ question: object, disabled?: boolean, error?: string }} props
 */
export function RadioQuestion({ question, disabled = false, error }) {
  const { control } = useFormContext();

  const answer = (
    <Controller
      name={`answers.${question.key}.value`}
      control={control}
      render={({ field }) => (
        <FormControl error={Boolean(error)} disabled={disabled} fullWidth>
          <RadioGroup {...field} value={field.value ?? ''}>
            {(question.options ?? []).map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio size="small" />}
                label={option}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{error || question.helperText || ' '}</FormHelperText>
        </FormControl>
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
