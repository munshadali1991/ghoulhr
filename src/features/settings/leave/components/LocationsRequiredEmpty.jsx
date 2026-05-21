import { Paper, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

export function LocationsRequiredEmpty() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        textAlign: 'center',
        borderStyle: 'dashed',
        borderRadius: 2,
        bgcolor: 'background.default',
      }}
    >
      <BusinessOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Configure locations first
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
        Save at least one location under the Locations tab. Then you can create leave types for each
        location.
      </Typography>
    </Paper>
  );
}
