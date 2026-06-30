import { Avatar, Box, Grid, Skeleton } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';

export function OrganizationProfileSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <PageCard>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton variant="circular" width={120} height={120} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width="100%" height={56} />
          </Box>
        </PageCard>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <PageCard>
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width="100%" height={56} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </PageCard>
      </Grid>
    </Grid>
  );
}

/** @param {{ logoPreview: string | null, name: string }} props */
export function OrganizationIdentityReadOnly({ logoPreview, name }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Avatar
        src={logoPreview || undefined}
        sx={{
          width: 120,
          height: 120,
          mb: 2,
          border: '2px solid',
          borderColor: 'divider',
        }}
      />
      <Box component="span" sx={{ typography: 'h6', fontWeight: 600, textAlign: 'center' }}>
        {name || '—'}
      </Box>
    </Box>
  );
}
