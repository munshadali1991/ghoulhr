import { Card, CardContent, Box, Typography, Divider } from '@mui/material';

export function SettingsSection({ icon, title, description, children, actions }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: 'background.default',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
        </Box>
        <Divider sx={{ mb: 3 }} />
        {children}
      </CardContent>
    </Card>
  );
}
