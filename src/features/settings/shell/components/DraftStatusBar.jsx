import { Paper, Box, Typography, Chip, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import { SETTINGS_PAGE_MAX_WIDTH } from '@/shared/components/settings/settingsLayout';

/**
 * @param {{
 *   hasChanges: boolean,
 *   isPublishing: boolean,
 *   onPublish: () => void,
 *   onDiscard: () => void,
 *   changeCount: number,
 *   maxWidth?: number,
 * }} props
 */
export function DraftStatusBar({
  hasChanges,
  isPublishing,
  onPublish,
  onDiscard,
  changeCount,
  maxWidth = SETTINGS_PAGE_MAX_WIDTH,
}) {
  if (!hasChanges) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1000,
        boxShadow: (theme) => theme.palette.custom.surfaces.draftBarShadow,
      }}
    >
      <Box
        sx={{
          maxWidth,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`${changeCount} unsaved change${changeCount !== 1 ? 's' : ''}`}
            color="warning"
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            You have unpublished changes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onDiscard} disabled={isPublishing}>
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={onPublish}
            disabled={isPublishing}
            startIcon={isPublishing ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isPublishing ? 'Publishing...' : 'Publish Changes'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
