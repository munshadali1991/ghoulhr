import { Paper, Typography } from '@mui/material';

export function LocationsEmptyState() {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
      <Typography color="text.secondary">
        No locations yet. Use Add location above to create your first site. It will be available
        across attendance, leave, and reporting.
      </Typography>
    </Paper>
  );
}
