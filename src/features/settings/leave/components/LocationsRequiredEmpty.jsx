import { Box, Button } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/features/settings/shared';

export function LocationsRequiredEmpty() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 4 }}>
      <EmptyState
        title="Configure locations first"
        description="Save at least one location under Settings → Locations. Then you can create leave types for each location."
        icon={<BusinessOutlinedIcon sx={{ fontSize: 40 }} />}
      />
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/settings/locations')}>
          Go to Locations
        </Button>
      </Box>
    </Box>
  );
}
