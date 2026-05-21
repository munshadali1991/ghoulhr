import { Skeleton, Stack } from '@mui/material';

export function LocationsLoadingSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}
