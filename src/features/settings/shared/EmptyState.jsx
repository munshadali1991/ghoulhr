import { Box, Typography } from '@mui/material';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';

export function EmptyState({ title, description, icon }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 1.5 }}>
        {icon ?? <CorporateFareOutlinedIcon sx={{ fontSize: 40 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
        {description}
      </Typography>
    </Box>
  );
}
