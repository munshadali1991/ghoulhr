/** Shared layout tokens for settings presentation components. */

export const SETTINGS_PAGE_MAX_WIDTH = 1200;
export const SETTINGS_PAGE_WIDE_MAX_WIDTH = 1320;

export const settingsSectionIconSx = {
  p: 1,
  bgcolor: 'background.default',
  borderRadius: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 48,
};

export const settingsPageContainerSx = (maxWidth, hasDraftBar) => ({
  maxWidth,
  mx: 'auto',
  pb: hasDraftBar ? 8 : 0,
  width: '100%',
});
