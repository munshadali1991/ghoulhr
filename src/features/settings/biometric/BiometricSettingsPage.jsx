import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { listEmployees } from '@/features/employees/api/employeesApi';
import { getLocations } from '@/features/settings/api/settingsApi';
import {
  assignBiometricId,
  clearBiometricId,
  createBiometricDevice,
  deleteBiometricDevice,
  getNextBiometricId,
  listBiometricDevices,
  listBiometricMappings,
  updateBiometricDevice,
} from './api/biometricApi';

const DEVICE_STATUSES = ['ACTIVE', 'INACTIVE', 'DISABLED'];

/**
 * @param {{ organizationId: string }} props
 */
export function BiometricSettingsPage({ organizationId }) {
  const { can } = useAuthorization();
  const canReadDevices = can('settings.biometric.devices:read');
  const canWriteDevices = can('settings.biometric.devices:write');
  const canReadMapping = can('settings.biometric.mapping:read');
  const canWriteMapping = can('settings.biometric.mapping:write');

  const [tab, setTab] = useState(canReadDevices ? 'devices' : 'mapping');

  if (!canReadDevices && !canReadMapping) {
    return (
      <Alert severity="warning">You do not have permission to view biometric settings.</Alert>
    );
  }

  return (
    <Box data-testid="settings-biometric-page">
      <PageHeader
        title="Biometric devices"
        subtitle="Register ZKTeco wall units and map hardware PINs to employees. Templates stay on the device."
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {canReadDevices ? <Tab value="devices" label="Devices" /> : null}
        {canReadMapping ? <Tab value="mapping" label="ID mapping" /> : null}
      </Tabs>
      {tab === 'devices' && canReadDevices ? (
        <DevicesPanel
          organizationId={organizationId}
          canWrite={canWriteDevices}
        />
      ) : null}
      {tab === 'mapping' && canReadMapping ? (
        <MappingPanel
          organizationId={organizationId}
          canWrite={canWriteMapping}
        />
      ) : null}
    </Box>
  );
}

function DevicesPanel({ organizationId, canWrite }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    serialNumber: '',
    name: '',
    locationId: '',
    status: 'ACTIVE',
    commKey: '',
  });

  const devicesQuery = useQuery({
    queryKey: ['biometric-devices', organizationId],
    queryFn: () => listBiometricDevices(organizationId),
  });

  const locationsQuery = useQuery({
    queryKey: ['locations', organizationId],
    queryFn: () => getLocations(organizationId),
  });

  const locations = useMemo(() => {
    const raw = locationsQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.locations)) return raw.locations;
    return [];
  }, [locationsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        serialNumber: form.serialNumber.trim(),
        name: form.name.trim(),
        locationId: form.locationId || undefined,
        status: form.status,
        brand: 'ZKTECO',
      };
      if (form.commKey?.trim()) payload.commKey = form.commKey.trim();
      if (editing?.id) {
        return updateBiometricDevice(organizationId, editing.id, payload);
      }
      return createBiometricDevice(organizationId, payload);
    },
    onSuccess: async () => {
      setDialogOpen(false);
      setEditing(null);
      setFormError('');
      await queryClient.invalidateQueries({ queryKey: ['biometric-devices', organizationId] });
    },
    onError: (err) => {
      setFormError(err?.message || 'Failed to save device');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBiometricDevice(organizationId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['biometric-devices', organizationId] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      serialNumber: '',
      name: '',
      locationId: '',
      status: 'ACTIVE',
      commKey: '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (device) => {
    setEditing(device);
    setForm({
      serialNumber: device.serialNumber || '',
      name: device.name || '',
      locationId: device.locationId || '',
      status: device.status || 'ACTIVE',
      commKey: '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const devices = Array.isArray(devicesQuery.data) ? devicesQuery.data : [];

  return (
    <>
      <SettingsSection
        icon={<FingerprintIcon color="primary" />}
        title="Device registry"
        description="Configure each wall unit with this tenant’s Cloud Server URL (subdomain or org port), then register its serial number here before go-live."
        actions={
          canWrite ? (
            <CrudButton intent="create" color="primary" startIcon={<AddIcon />} onClick={openCreate}>
              Add device
            </CrudButton>
          ) : null
        }
      >
        {devicesQuery.isError ? (
          <Alert severity="error">Failed to load devices.</Alert>
        ) : null}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Serial</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last seen</TableCell>
              {canWrite ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 6 : 5}>
                  <Typography color="text.secondary">No devices registered yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              devices.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.serialNumber}</TableCell>
                  <TableCell>{d.locationName || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={d.status} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : 'Never'}
                  </TableCell>
                  {canWrite ? (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => openEdit(d)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm(`Remove device ${d.serialNumber}?`)) {
                              deleteMutation.mutate(d.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SettingsSection>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit device' : 'Register device'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField
              label="Serial number"
              required
              fullWidth
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
            />
            <TextField
              label="Display name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              select
              label="Location"
              fullWidth
              value={form.locationId}
              onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name || loc.locationName || loc.id}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {DEVICE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Comm key (optional)"
              fullWidth
              type="password"
              helperText={
                editing?.hasCommKey
                  ? 'Leave blank to keep the existing key'
                  : 'Optional shared secret if the device sends CommKey'
              }
              value={form.commKey}
              onChange={(e) => setForm((f) => ({ ...f, commKey: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={saveMutation.isPending || !form.serialNumber.trim() || !form.name.trim()}
            onClick={() => saveMutation.mutate()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function MappingPanel({ organizationId, canWrite }) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [biometricId, setBiometricId] = useState('');
  const [formError, setFormError] = useState('');

  const mappingsQuery = useQuery({
    queryKey: ['biometric-mappings', organizationId, q],
    queryFn: () => listBiometricMappings(organizationId, q),
  });

  const employeesQuery = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => listEmployees(),
    enabled: dialogOpen,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {};
      if (biometricId.trim()) payload.biometricId = Number(biometricId);
      return assignBiometricId(organizationId, employeeId, payload);
    },
    onSuccess: async () => {
      setDialogOpen(false);
      setFormError('');
      await queryClient.invalidateQueries({ queryKey: ['biometric-mappings', organizationId] });
    },
    onError: (err) => setFormError(err?.message || 'Failed to assign biometric ID'),
  });

  const clearMutation = useMutation({
    mutationFn: (id) => clearBiometricId(organizationId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['biometric-mappings', organizationId] }),
  });

  const openAssign = async () => {
    setEmployeeId('');
    setBiometricId('');
    setFormError('');
    setDialogOpen(true);
    try {
      const next = await getNextBiometricId(organizationId);
      if (next?.biometricId != null) setBiometricId(String(next.biometricId));
    } catch {
      /* optional */
    }
  };

  const mappings = Array.isArray(mappingsQuery.data) ? mappingsQuery.data : [];
  const employees = Array.isArray(employeesQuery.data)
    ? employeesQuery.data
    : Array.isArray(employeesQuery.data?.employees)
      ? employeesQuery.data.employees
      : [];

  return (
    <>
      <SettingsSection
        icon={<FingerprintIcon color="primary" />}
        title="Hardware PIN mapping"
        description="Assign the integer PIN enrolled on the wall device to an HRMS employee. Never store fingerprint or face templates."
        actions={
          canWrite ? (
            <CrudButton intent="create" color="primary" startIcon={<AddIcon />} onClick={openAssign}>
              Assign ID
            </CrudButton>
          ) : null
        }
      >
        <TextField
          size="small"
          placeholder="Search name, code, or PIN"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ mb: 2, maxWidth: 360 }}
        />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Biometric ID</TableCell>
              <TableCell>Status</TableCell>
              {canWrite ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 5 : 4}>
                  <Typography color="text.secondary">No biometric IDs assigned yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              mappings.map((m) => (
                <TableRow key={m.employeeId} hover>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.employeeCode}</TableCell>
                  <TableCell>{m.biometricId}</TableCell>
                  <TableCell>{m.status}</TableCell>
                  {canWrite ? (
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(`Clear biometric ID for ${m.employeeCode}?`)) {
                            clearMutation.mutate(m.employeeId);
                          }
                        }}
                      >
                        Clear
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SettingsSection>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign biometric ID</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
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
              label="Biometric ID (PIN)"
              type="number"
              fullWidth
              helperText="Leave as suggested value or set the PIN enrolled on the device"
              value={biometricId}
              onChange={(e) => setBiometricId(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={saveMutation.isPending || !employeeId}
            onClick={() => saveMutation.mutate()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
