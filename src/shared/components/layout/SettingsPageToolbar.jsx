import { Box, Stack, Typography } from '@mui/material';

/**
 * Settings page toolbar shell: title (h4), subtitle, optional tabs/chips/children, action slots.
 * Primary action should be a CrudButton (create/save) for in-app CRUD.
 *
 * @param {{
 *   title: import('react').ReactNode,
 *   subtitle?: import('react').ReactNode,
 *   primaryAction?: import('react').ReactNode,
 *   secondaryActions?: import('react').ReactNode,
 *   children?: import('react').ReactNode,
 *   sx?: import('@mui/material').SxProps,
 * }} props
 */
export function SettingsPageToolbar({
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  children,
  sx,
}) {
  const hasActions = Boolean(primaryAction || secondaryActions);

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h4" component="h1" fontWeight={600} letterSpacing="-0.02em">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
            {subtitle}
          </Typography>
        ) : null}
        {children}
      </Box>

      {hasActions ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          {secondaryActions}
          {primaryAction}
        </Stack>
      ) : null}
    </Box>
  );
}
