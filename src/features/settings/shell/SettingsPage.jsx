import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_SETTINGS_SLUG,
  currentSettingsSlugFromPath,
  isWideSettingsLayout,
} from '@/features/settings/shell/settingsNav';
import {
  SETTINGS_PAGE_MAX_WIDTH,
  SETTINGS_PAGE_WIDE_MAX_WIDTH,
  settingsPageContainerSx,
} from '@/shared/components/settings/settingsLayout';
/**
 * Max-width layout wrapper for flat settings routes.
 * @param {{ organizationId?: string, children: import('react').ReactNode }} props
 */
export function SettingsShell({ children }) {
  const location = useLocation();
  const activeSlug = currentSettingsSlugFromPath(location.pathname) ?? DEFAULT_SETTINGS_SLUG;
  const pageMaxWidth = isWideSettingsLayout(activeSlug, location.pathname)
    ? SETTINGS_PAGE_WIDE_MAX_WIDTH
    : SETTINGS_PAGE_MAX_WIDTH;

  return (
    <Box sx={settingsPageContainerSx(pageMaxWidth, false)} key={location.pathname}>
      {children}
    </Box>
  );
}

export { SettingsShell as SettingsPage };
