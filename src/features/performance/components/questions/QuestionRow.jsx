import { Box, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { surface } from '@/shared/theme/surfaces';
import { QUESTION_TYPES } from '../../constants/performanceEnums';
import { RoleTag } from './RoleTag';
import { NarrativeQuestion } from './NarrativeQuestion';
import { RatingQuestion } from './RatingQuestion';
import { NumberQuestion } from './NumberQuestion';
import { TextQuestion } from './TextQuestion';
import { RadioQuestion } from './RadioQuestion';

function FieldForType({ question, disabled, error }) {
  switch (question.type) {
    case QUESTION_TYPES.NARRATIVE:
    case QUESTION_TYPES.TEXTAREA:
      return <NarrativeQuestion question={question} disabled={disabled} error={error} />;
    case QUESTION_TYPES.RADIO:
      return <RadioQuestion question={question} disabled={disabled} error={error} />;
    case QUESTION_TYPES.RATING:
    case QUESTION_TYPES.SELECT:
      return <RatingQuestion question={question} disabled={disabled} error={error} />;
    case QUESTION_TYPES.NUMBER:
      return <NumberQuestion question={question} disabled={disabled} error={error} />;
    case QUESTION_TYPES.TEXT:
    default:
      return <TextQuestion question={question} disabled={disabled} error={error} />;
  }
}

/**
 * A single scannable question line: grey shaded header (`> N. label`) followed
 * by the role tag + the type-appropriate input control.
 * @param {{
 *   question: object,
 *   fillRole: string,
 *   roleLabel?: string,
 *   disabled?: boolean,
 *   error?: string,
 * }} props
 */
export function QuestionRow({ question, fillRole, roleLabel, disabled = false, error }) {
  return (
    <Box
      data-question={question.key}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          bgcolor: surface.muted,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ChevronRightRoundedIcon sx={{ fontSize: 20, color: 'text.secondary', mt: '1px' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
          {question.number}. {question.label}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '72px 1fr' },
          gap: { xs: 1, sm: 2 },
          px: { xs: 1.5, sm: 2 },
          py: 2,
          alignItems: 'start',
        }}
      >
        <Box sx={{ pt: 1 }}>
          <RoleTag role={fillRole} roleLabel={roleLabel} />
        </Box>
        <FieldForType question={question} disabled={disabled} error={error} />
      </Box>
    </Box>
  );
}
