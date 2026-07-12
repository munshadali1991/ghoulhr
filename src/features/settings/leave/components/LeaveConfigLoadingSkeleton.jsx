import { Box, Skeleton, Stack } from '@mui/material';

export function LeaveConfigLoadingSkeleton() {
  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={220} height={40} />
          <Skeleton variant="text" width={360} height={24} />
        </Box>
        <Skeleton variant="rounded" width={160} height={40} sx={{ borderRadius: 1 }} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 5 }} />
        <Skeleton variant="rounded" width={120} height={28} sx={{ borderRadius: 5 }} />
      </Stack>
      <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2, mb: 1.5 }} />
      <Skeleton variant="rounded" height={88} sx={{ borderRadius: 2, mb: 1 }} />
      <Skeleton variant="rounded" height={88} sx={{ borderRadius: 2, mb: 1 }} />
      <Skeleton variant="rounded" height={88} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
