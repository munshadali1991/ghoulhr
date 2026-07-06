import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';

/**
 * @param {{ onAddSection?: () => void, readOnly?: boolean }} props
 */
export function BuilderEmptyState({ onAddSection, readOnly = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        px: 3,
        textAlign: 'center',
      }}
    >
      <AssignmentTurnedInRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Build your performance template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mb: 3 }}>
        Create sections manually, choose who fills each part using your organization roles,
        and add questions with text, radio, dropdown, and rating inputs.
      </Typography>
      {!readOnly && onAddSection ? (
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onAddSection}>
          Create first section
        </Button>
      ) : null}
    </Box>
  );
}
