import { Chip, Stack } from '@mui/material';
import { QUESTION_TYPE_LABELS, QUESTION_TYPES } from '../utils/performanceMasterMappers';

/**
 * @param {{
 *   value: string,
 *   onChange: (type: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function QuestionTypePicker({ value, onChange, disabled = false }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {QUESTION_TYPES.map((type) => (
        <Chip
          key={type}
          label={QUESTION_TYPE_LABELS[type] ?? type}
          color={value === type ? 'primary' : 'default'}
          variant={value === type ? 'filled' : 'outlined'}
          onClick={disabled ? undefined : () => onChange(type)}
          sx={{
            cursor: disabled ? 'default' : 'pointer',
            borderRadius: 5,
            fontWeight: 600,
            typography: 'caption',
          }}
        />
      ))}
    </Stack>
  );
}
