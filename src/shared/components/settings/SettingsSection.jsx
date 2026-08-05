import { CardContent, Box, Typography, Divider } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { settingsSectionIconSx } from './settingsLayout';

/**
 * Card section wrapper for settings tabs (icon header + body).
 * @param {{
 *   icon?: React.ReactNode,
 *   title: string,
 *   description?: string,
 *   children: React.ReactNode,
 *   actions?: React.ReactNode,
 * }} props
 */
export function SettingsSection({ icon, title, description, children, actions }) {
  return (
    <PageCard sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            gap: 2,
            mb: 3,
          }}
        >
          {icon != null && <Box sx={settingsSectionIconSx}>{icon}</Box>}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            ) : null}
          </Box>
          {actions ? (
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>{actions}</Box>
          ) : null}
        </Box>
        <Divider sx={{ mb: 3 }} />
        {children}
      </CardContent>
    </PageCard>
  );
}
