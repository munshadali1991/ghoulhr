import { Box, Skeleton } from '@mui/material';

export function LeaveConfigLoadingSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
