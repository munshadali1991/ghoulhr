import { Box, Paper, Typography } from '@mui/material';
import { surface } from '@/shared/theme/surfaces';

/**
 * @param {{
 *   title: string,
 *   description?: string,
 *   flush?: boolean,
 *   children: import('react').ReactNode,
 * }} props
 */
export function FormSectionCard({ title, description, flush = false, children }) {
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
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: surface.subtle,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'text.secondary',
            fontSize: '0.6875rem',
            lineHeight: 1.4,
            display: 'block',
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box sx={flush ? undefined : { px: { xs: 2, sm: 2.5 }, py: 2 }}>{children}</Box>
    </Paper>
  );
}
