import { useCallback, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const STORAGE_KEY = 'ghoulhr.performance.templateBannerDismissed';

/**
 * Dismissible banner explaining master vs snapshot behavior.
 * Reappears each session until dismissed again (sessionStorage).
 */
export function TemplateContextBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  if (dismissed) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        mb: 2.5,
        px: 2,
        py: 1.5,
        borderRadius: 1.5,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(96, 165, 250, 0.12)'
            : 'rgba(59, 130, 246, 0.1)',
        color: 'text.primary',
      }}
    >
      <InfoOutlinedIcon color="secondary" sx={{ fontSize: 18, mt: 0.15, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.5 }}>
        Editing template — changes apply to future assignments only. Already-assigned assessments
        keep their original version.
      </Typography>
      <IconButton
        aria-label="Dismiss"
        size="small"
        onClick={handleDismiss}
        sx={{ flexShrink: 0, color: 'text.secondary' }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
