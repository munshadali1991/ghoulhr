import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import dayjs from 'dayjs';

/**
 * Full-width callout with the global assessment description and the deadline alert.
 * @param {{ description?: string, dueDate?: string }} props
 */
export function InstructionalCallout({ description, dueDate }) {
  const due = dueDate ? dayjs(dueDate) : null;
  const dueLabel = due?.isValid() ? due.format('DD MMM YYYY') : null;

  const text =
    description ||
    'Please complete your self-assessment before the stipulated deadline, as it is required for your manager to complete your performance review within the timeline.';

  return (
    <Alert
      severity="info"
      icon={<InfoOutlinedIcon />}
      sx={{ borderRadius: 1, alignItems: 'flex-start' }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>Assessment Description</AlertTitle>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {text}
      </Typography>
      {dueLabel ? (
        <Box sx={{ mt: 1, fontWeight: 700, color: 'warning.dark' }}>
          Deadline: complete your self-assessment by {dueLabel}.
        </Box>
      ) : null}
    </Alert>
  );
}
