import { Box, Paper, Stack, Typography } from '@mui/material';

/** Read-only summary card before opening a full-page settings form. */
export function SettingsOverviewCard({ title, description, children, maxWidth = '100%' }) {
  return (
    <Box sx={{ maxWidth, width: '100%' }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}

export function SettingsOverviewRow({ label, children }) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 2.5 },
        py: 1.75,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 0.75, sm: 3 },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 140, fontWeight: 500, pt: { sm: 0.25 } }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

export function SettingsMetricStrip({ items }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(items.length, 3)}, 1fr)` },
        gap: 1.5,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 1.5,
            bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            {item.label}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
            {item.value}
          </Typography>
          {item.hint ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {item.hint}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}
