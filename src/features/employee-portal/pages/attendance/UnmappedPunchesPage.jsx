import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { useAuth } from '@/app/providers/useAuth';
import { listEmployees } from '@/features/employees/api/employeesApi';
import {
  listUnmappedPunches,
  resolveUnmappedPunch,
} from '@/features/settings/biometric/api/biometricApi';

export function UnmappedPunchesPage() {
  const { can } = useAuthorization();
  const { user } = useAuth();
  const organizationId = user?.organizationId;
  const canRead = can('ess.attendance.unmapped:read');
  const canWrite = can('ess.attendance.unmapped:write');
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const query = useQuery({
    queryKey: ['biometric-unmapped', organizationId],
    queryFn: () => listUnmappedPunches(organizationId, 'OPEN'),
    enabled: Boolean(canRead && organizationId),
    refetchInterval: 15000,
  });

  const employeesQuery = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => listEmployees(),
    enabled: Boolean(selected && canWrite),
  });

  const resolveMutation = useMutation({
    mutationFn: (payload) =>
      resolveUnmappedPunch(organizationId, selected.id, payload),
    onSuccess: async () => {
      setSelected(null);
      setFormError('');
      await queryClient.invalidateQueries({ queryKey: ['biometric-unmapped', organizationId] });
      await queryClient.invalidateQueries({ queryKey: ['biometric-mappings', organizationId] });
    },
    onError: (err) => setFormError(err?.message || 'Failed to resolve punch'),
  });

  const rows = useMemo(
    () => (Array.isArray(query.data) ? query.data : []),
    [query.data],
  );

  const employees = Array.isArray(employeesQuery.data)
    ? employeesQuery.data
    : Array.isArray(employeesQuery.data?.employees)
      ? employeesQuery.data.employees
      : [];

  if (!canRead) {
    return (
      <Alert severity="warning">
        You do not have permission to view unmapped biometric punches.
      </Alert>
    );
  }

  return (
    <Box data-testid="attendance-unmapped-page">
      <PageHeader
        title="Unmapped punches"
        subtitle="Hardware PINs that scanned but are not linked to an employee yet. Binding retroactively associates open logs."
      />
      <PageCard>
        {query.isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load unmapped punches.
          </Alert>
        ) : null}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Scan time</TableCell>
              <TableCell>PIN</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Raw type</TableCell>
              {canWrite ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4}>
                  <Typography color="text.secondary">No open unmapped punches.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{new Date(r.eventTimestamp).toLocaleString()}</TableCell>
                  <TableCell>{r.biometricId}</TableCell>
                  <TableCell>
                    {r.deviceName || r.serialNumber}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {r.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.rawPunchType || '—'}</TableCell>
                  {canWrite ? (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelected(r);
                            setEmployeeId('');
                            setReason('');
                            setFormError('');
                          }}
                        >
                          Bind
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Ignore all open punches for PIN ${r.biometricId}?`,
                              )
                            ) {
                              resolveUnmappedPunch(organizationId, r.id, {
                                action: 'ignore',
                                reason: 'Ignored from unmapped queue',
                              }).then(() =>
                                queryClient.invalidateQueries({
                                  queryKey: ['biometric-unmapped', organizationId],
                                }),
                              );
                            }
                          }}
                        >
                          Ignore
                        </Button>
                      </Stack>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PageCard>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Bind PIN {selected?.biometricId} to employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <Typography variant="body2" color="text.secondary">
              All open unmapped punches for this PIN will be converted and linked.
            </Typography>
            <TextField
              select
              label="Employee"
              fullWidth
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} ({e.employeeCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reason (audit)"
              fullWidth
              multiline
              minRows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!employeeId || resolveMutation.isPending}
            onClick={() =>
              resolveMutation.mutate({
                action: 'bind',
                employeeId,
                reason: reason || undefined,
              })
            }
          >
            Bind & convert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
