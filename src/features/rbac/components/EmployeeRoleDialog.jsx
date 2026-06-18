import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getEmployeeRoles } from '@/features/rbac/api/rbacApi';
import { useAssignEmployeeRoles, useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { useAuth } from '@/app/providers/useAuth';
import { ConfirmDialog } from '@/features/rbac/components/ConfirmDialog';

function getInitials(name) {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function RoleCheckboxList({ title, roles, selectedRoleIds, canManage, onToggle }) {
  if (roles.length === 0) return null;

  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8 }}>
        {title}
      </Typography>
      <List dense disablePadding sx={{ mt: 0.5 }}>
        {roles.map((role) => {
          const selected = selectedRoleIds.includes(role.id);
          return (
            <ListItem
              key={role.id}
              disablePadding
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: selected ? 'action.selected' : 'transparent',
                border: 1,
                borderColor: selected ? 'primary.light' : 'divider',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, pl: 1 }}>
                <Checkbox
                  edge="start"
                  checked={selected}
                  onChange={() => onToggle(role.id)}
                  disabled={!canManage}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {role.name}
                    </Typography>
                    {role.isSystem && (
                      <Chip label="System" size="small" variant="outlined" sx={{ height: 20 }} />
                    )}
                  </Stack>
                }
                secondary={`${role.code} · ${role.permissionCount ?? 0} permissions`}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

/**
 * @param {{
 *   open: boolean,
 *   employee: { id: string, name: string, employeeCode: string, departmentName?: string } | null,
 *   onClose: () => void,
 * }} props
 */
export function EmployeeRoleDialog({ open, employee, onClose }) {
  const { can } = useAuthorization();
  const { refreshSession } = useAuth();
  const canManage = can('rbac:manage');
  const { data: roles = [] } = useRbacRoles();
  const assignMutation = useAssignEmployeeRoles();

  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [primaryRoleId, setPrimaryRoleId] = useState('');
  const [error, setError] = useState('');
  const [confirmRemoveAll, setConfirmRemoveAll] = useState(false);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['rbac', 'employee-roles', employee?.id],
    queryFn: () => getEmployeeRoles(employee.id),
    enabled: Boolean(employee?.id) && open,
  });

  const { systemRoles, customRoles } = useMemo(() => {
    const system = [];
    const custom = [];
    for (const role of roles) {
      if (role.isSystem) system.push(role);
      else custom.push(role);
    }
    return { systemRoles: system, customRoles: custom };
  }, [roles]);

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds],
  );

  useEffect(() => {
    if (!open || !employee?.id) {
      setSelectedRoleIds([]);
      setPrimaryRoleId('');
      setError('');
      setConfirmRemoveAll(false);
      return;
    }
    if (assignments === undefined) {
      return;
    }
    const roleIds = assignments.map((a) => a.roleId);
    const primary = assignments.find((a) => a.isPrimary)?.roleId ?? roleIds[0] ?? '';
    setSelectedRoleIds(roleIds);
    setPrimaryRoleId(primary);
  }, [employee?.id, open, assignments]);

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) => {
      const next = prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId];
      if (!next.includes(primaryRoleId)) {
        setPrimaryRoleId(next[0] ?? '');
      }
      return next;
    });
  };

  const performSave = async () => {
    if (!employee) return;
    setError('');
    try {
      await assignMutation.mutateAsync({
        employeeId: employee.id,
        roleIds: selectedRoleIds,
        primaryRoleId: primaryRoleId || selectedRoleIds[0],
      });
      await refreshSession?.();
      onClose();
    } catch (err) {
      setError(err.message ?? 'Failed to save roles');
    }
  };

  const handleSave = () => {
    if (!employee) return;
    if (selectedRoleIds.length === 0) {
      setConfirmRemoveAll(true);
      return;
    }
    performSave();
  };

  const handleClose = () => {
    if (assignMutation.isPending) return;
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontSize: '0.95rem' }}>
              {getInitials(employee?.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
                Manage role access
              </Typography>
              {employee && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {employee.name} · {employee.employeeCode}
                  {employee.departmentName ? ` · ${employee.departmentName}` : ''}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!canManage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You have read-only access. Contact an administrator to change role assignments.
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <RoleCheckboxList
                title="System roles"
                roles={systemRoles}
                selectedRoleIds={selectedRoleIds}
                canManage={canManage}
                onToggle={toggleRole}
              />

              {customRoles.length > 0 && (
                <>
                  {systemRoles.length > 0 && <Divider />}
                  <RoleCheckboxList
                    title="Custom roles"
                    roles={customRoles}
                    selectedRoleIds={selectedRoleIds}
                    canManage={canManage}
                    onToggle={toggleRole}
                  />
                </>
              )}

              {selectedRoleIds.length > 1 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <FormControl component="fieldset" disabled={!canManage} fullWidth>
                    <FormLabel component="legend" sx={{ typography: 'subtitle2', mb: 1 }}>
                      Primary role
                    </FormLabel>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Used when permissions overlap across multiple roles.
                    </Typography>
                    <RadioGroup
                      value={primaryRoleId}
                      onChange={(e) => setPrimaryRoleId(e.target.value)}
                    >
                      {selectedRoles.map((role) => (
                        <FormControlLabel
                          key={role.id}
                          value={role.id}
                          control={<Radio size="small" />}
                          label={role.name}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}

              {selectedRoleIds.length === 0 && !isLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No roles selected. Saving will remove all access for this employee.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={assignMutation.isPending}>
            Cancel
          </Button>
          {canManage && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={assignMutation.isPending || isLoading}
            >
              {assignMutation.isPending ? 'Saving…' : 'Save assignments'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmRemoveAll}
        title="Remove all roles?"
        message="This employee will have no roles assigned and may lose access to modules. Continue?"
        confirmLabel="Remove all roles"
        confirmColor="error"
        isPending={assignMutation.isPending}
        onConfirm={() => {
          setConfirmRemoveAll(false);
          performSave();
        }}
        onCancel={() => setConfirmRemoveAll(false)}
      />
    </>
  );
}
