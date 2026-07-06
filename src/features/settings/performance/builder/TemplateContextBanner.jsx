import { useCallback, useState } from 'react';
import { Alert, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

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
    <Alert
      severity="info"
      sx={{ mb: 2 }}
      action={
        <IconButton
          aria-label="Dismiss"
          color="inherit"
          size="small"
          onClick={handleDismiss}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      }
    >
      Editing template — changes apply to future assignments only. Already-assigned
      assessments keep their original version.
    </Alert>
  );
}
