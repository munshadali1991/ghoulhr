import { Box, Chip, Stack, Typography } from '@mui/material';

/**
 * @param {{ locationCount: number }} props
 */
export function LocationsPageHeader({ locationCount }) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          Locations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
          Manage all workplaces in one list. Use Add location for new entries; edit any row for full
          detail. Save applies the whole directory.
        </Typography>
      </Box>
      <Chip size="small" label={`${locationCount} configured`} variant="outlined" />
    </Stack>
  );
}
