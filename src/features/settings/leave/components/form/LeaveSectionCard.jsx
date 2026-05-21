import { Box, Paper, Typography } from '@mui/material';
import { surface } from '@/shared/theme/surfaces';

/** @param {{ title: string, children: React.ReactNode }} props */
export function LeaveSectionCard({ title, children }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: surface.subtle,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'text.secondary',
            fontSize: '0.7rem',
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>{children}</Box>
    </Paper>
  );
}
