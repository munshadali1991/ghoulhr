import { Box } from '@mui/material';
import { surface } from '@/shared/theme/surfaces';
import { AssessmentActions } from './AssessmentActions';

/**
 * Footer baseline that mirrors the top control bar's Save as Draft / Submit
 * actions. Forwards all props to AssessmentActions.
 */
export function AssessmentFooterBar(props) {
  return (
    <Box
      className="assessment-actions-print-hide"
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1,
        px: { xs: 1.5, sm: 2.5 },
        py: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: surface.subtle,
      }}
    >
      <AssessmentActions {...props} size="medium" showPdf={false} />
    </Box>
  );
}
