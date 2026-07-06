import { Box, Typography } from '@mui/material';

/**
 * Full-width blue divider banner used for the KPI section and role-gated
 * (Manager / HR) sections.
 * @param {{ title: string, action?: import('react').ReactNode }} props
 */
export function SectionBanner({ title, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        borderRadius: 1,
        bgcolor: 'secondary.main',
        color: 'common.white',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.01em' }}>
        {title}
      </Typography>
      {action}
    </Box>
  );
}
