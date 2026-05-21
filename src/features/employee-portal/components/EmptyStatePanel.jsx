import { Box, Typography } from '@mui/material';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';

/**
 * @param {{ title: string, description?: string, icon?: import('react').ReactNode }} props
 */
export function EmptyStatePanel({ title, description, icon }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <Box sx={{ opacity: 0.35, mb: 1 }}>{icon ?? <EventBusyRoundedIcon sx={{ fontSize: 56 }} />}</Box>
      <Typography variant="body2" fontWeight={600} color="text.secondary">
        {title}
      </Typography>
      {description ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
