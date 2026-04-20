import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material';

export function OverviewPage({ stats, activeCount, inactiveCount }) {
  const maxGrowthValue = Math.max(...stats.organizationGrowth.map((item) => item.count), 1);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Organizations
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalOrganizations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Users (All Orgs)
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Revenue (Monthly)
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                INR {Number(stats.totalRevenue ?? 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Organization Growth (Last 6 Months)
              </Typography>
              <Stack spacing={1.4}>
                {stats.organizationGrowth.map((entry) => (
                  <Box key={entry.month}>
                    <Stack direction="row" justifyContent="space-between" mb={0.4}>
                      <Typography variant="body2">{entry.month}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {entry.count}
                      </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 99, bgcolor: 'grey.200' }}>
                      <Box
                        sx={{
                          width: `${(entry.count / maxGrowthValue) * 100}%`,
                          height: '100%',
                          borderRadius: 99,
                          bgcolor: 'primary.main',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1.25}>
                Org Status Snapshot
              </Typography>
              <Stack spacing={1}>
                <Paper variant="outlined" sx={{ p: 1.25 }}>
                  <Typography variant="body2">Active Organizations</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {activeCount}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.25 }}>
                  <Typography variant="body2">Inactive Organizations</Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    {inactiveCount}
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

