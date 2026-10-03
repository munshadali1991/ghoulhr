import { Box, Typography } from '@mui/material';

/**
 * @param {{
 *   title: string,
 *   description?: string,
 * }} props
 */
export function PeopleEmptyState({ title, description }) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
