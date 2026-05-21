import { Box, Skeleton } from '@mui/material';

export function EmployeeSettingsLoadingSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
