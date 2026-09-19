import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { fetchLiveAttendance } from '@/features/settings/biometric/api/biometricApi';

export function LiveAttendancePage() {
  const { can } = useAuthorization();
  const allowed = can('ess.attendance.live:read');

  const query = useQuery({
    queryKey: ['attendance-live'],
    queryFn: () => fetchLiveAttendance({ limit: 80 }),
    enabled: allowed,
    refetchInterval: 8000,
  });

  const rows = useMemo(
    () => (Array.isArray(query.data) ? query.data : []),
    [query.data],
  );

  if (!allowed) {
    return (
      <Alert severity="warning">You do not have permission to view the live attendance feed.</Alert>
    );
  }

  return (
    <Box data-testid="attendance-live-page">
      <PageHeader
        title="Live attendance"
        subtitle="Biometric check-ins across registered devices. Updates every few seconds."
      />
      <PageCard>
        {query.isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load live feed.
          </Alert>
        ) : null}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {rows.length} recent punch{rows.length === 1 ? '' : 'es'}
          </Typography>
          <Chip
            size="small"
            color={query.isFetching ? 'default' : 'success'}
            label={query.isFetching ? 'Refreshing…' : 'Live'}
            variant="outlined"
          />
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>PIN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">
                    No biometric punches yet. Waiting for device activity…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{new Date(r.punchedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {r.name}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {r.employeeCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.punchType}
                      color={r.punchType === 'IN' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{r.deviceSerial || '—'}</TableCell>
                  <TableCell>{r.hardwareUserId ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PageCard>
    </Box>
  );
}
