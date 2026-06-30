import { useLayoutEffect, useState } from 'react';
import { Alert, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { currentSettingsSlugFromPath } from '@/features/settings/shell/settingsNav';

/**
 * Dev-only strip comparing React Router location vs browser URL.
 */
export function RouteDebugBanner() {
  const location = useLocation();
  const browserPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const [mountedPage, setMountedPage] = useState('none');

  useLayoutEffect(() => {
    const testId =
      document.querySelector('[data-testid^="settings-"]')?.getAttribute('data-testid') ?? 'none';
    setMountedPage(testId);
  }, [location.pathname]);

  if (!import.meta.env.DEV) {
    return null;
  }

  const slug = currentSettingsSlugFromPath(location.pathname);
  const desync = browserPath !== location.pathname;

  return (
    <Alert severity={desync ? 'error' : 'info'} sx={{ mb: 2, py: 0.5 }}>
      <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
        RR: {location.pathname} | Browser: {browserPath} | Slug: {slug ?? 'null'} | Mounted:{' '}
        {mountedPage}
        {desync ? ' | DESYNC' : ''}
      </Typography>
    </Alert>
  );
}
