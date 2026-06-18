import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { useAuth } from '@/app/providers/useAuth';
import {
  useCloneRbacRole,
  useCreateRbacRole,
  useDeactivateRbacRole,
  useRbacPermissions,
  useRbacRoleDetail,
  useRbacRoles,
  useUpdateRbacRole,
  useUpdateRolePermissions,
} from '@/features/rbac/hooks/useRbacAdmin';
import { RoleCatalogPanel } from '@/features/rbac/components/RoleCatalogPanel';
import { RoleDetailPanel } from '@/features/rbac/components/RoleDetailPanel';
import { CreateRoleDialog } from '@/features/rbac/components/CreateRoleDialog';
import { CloneRoleDialog } from '@/features/rbac/components/CloneRoleDialog';
import { EditRoleDialog } from '@/features/rbac/components/EditRoleDialog';
import { ConfirmDialog } from '@/features/rbac/components/ConfirmDialog';
import { DEFAULT_ACCESS_SCOPE } from '@/features/rbac/constants/accessScopes';
import { buildPermissionMatrix } from '@/features/rbac/utils/permissionMatrix';
import {
  countPermissionDraftChanges,
  permissionsFromDetail,
} from '@/features/rbac/utils/permissionDraft';

/**
 * @param {{
 *   createOpen?: boolean,
 *   onCreateOpenChange?: (open: boolean) => void,
 *   onDraftStateChange?: (state: {
 *     hasChanges: boolean,
 *     changeCount: number,
 *     onSave: () => Promise<void>,
 *     onDiscard: () => void,
 *     isSaving: boolean,
 *   } | null) => void,
 * }} props
 */
export function RolesPanel({
  createOpen: createOpenProp,
  onCreateOpenChange,
  onDraftStateChange,
}) {
  const { can } = useAuthorization();
  const { refreshSession } = useAuth();
  const canManage = can('rbac:manage');

  const { data: roles = [], isLoading: rolesLoading } = useRbacRoles();
  const { data: permissions = [] } = useRbacPermissions();
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const effectiveSelectedId = useMemo(() => {
    if (selectedRoleId && roles.some((r) => r.id === selectedRoleId)) {
      return selectedRoleId;
    }
    return roles[0]?.id ?? '';
  }, [selectedRoleId, roles]);

  useEffect(() => {
    if (!selectedRoleId && roles[0]?.id) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const { data: roleDetail, isLoading: roleLoading } = useRbacRoleDetail(effectiveSelectedId);
  const updateMutation = useUpdateRolePermissions();
  const createMutation = useCreateRbacRole();
  const cloneMutation = useCloneRbacRole();
  const deactivateMutation = useDeactivateRbacRole();
  const updateRoleMutation = useUpdateRbacRole();

  const [draftPermissions, setDraftPermissions] = useState(null);
  const [createOpenInternal, setCreateOpenInternal] = useState(false);
  const createOpen = createOpenProp ?? createOpenInternal;
  const setCreateOpen = onCreateOpenChange ?? setCreateOpenInternal;
  const [cloneSource, setCloneSource] = useState(null);
  const [createWarning, setCreateWarning] = useState('');
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [enabledOnly, setEnabledOnly] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    confirmColor: 'primary',
    onConfirm: () => {},
  });

  const savedPermissions = useMemo(
    () => permissionsFromDetail(roleDetail),
    [roleDetail],
  );

  const activePermissions = draftPermissions ?? savedPermissions;
  const hasUnsavedChanges = draftPermissions !== null;
  const changeCount = hasUnsavedChanges
    ? countPermissionDraftChanges(savedPermissions, draftPermissions)
    : 0;

  const matrix = useMemo(() => buildPermissionMatrix(permissions), [permissions]);
  const enabledCount = activePermissions.length;
  const totalCount = permissions.length;
  const moduleCount = matrix.length;

  const handleSave = useCallback(async () => {
    if (!effectiveSelectedId || draftPermissions === null) return;
    await updateMutation.mutateAsync({
      roleId: effectiveSelectedId,
      permissions: draftPermissions,
    });
    setDraftPermissions(null);
    await refreshSession?.();
  }, [effectiveSelectedId, draftPermissions, updateMutation, refreshSession]);

  const handleDiscard = useCallback(() => {
    setDraftPermissions(null);
  }, []);

  useEffect(() => {
    if (!onDraftStateChange) return;
    if (!hasUnsavedChanges) {
      onDraftStateChange(null);
      return;
    }
    onDraftStateChange({
      hasChanges: true,
      changeCount,
      onSave: handleSave,
      onDiscard: handleDiscard,
      isSaving: updateMutation.isPending,
    });

    return () => {
      onDraftStateChange(null);
    };
  }, [
    onDraftStateChange,
    hasUnsavedChanges,
    changeCount,
    handleSave,
    handleDiscard,
    updateMutation.isPending,
  ]);

  const handleRoleSelect = (roleId) => {
    if (roleId === effectiveSelectedId) return;
    if (hasUnsavedChanges) {
      setConfirmDialog({
        open: true,
        title: 'Discard unsaved changes?',
        message:
          'You have unsaved permission changes for the current role. Switching roles will discard them.',
        confirmLabel: 'Discard & switch',
        confirmColor: 'warning',
        onConfirm: () => {
          setDraftPermissions(null);
          setSelectedRoleId(roleId);
          setConfirmDialog((d) => ({ ...d, open: false }));
        },
      });
      return;
    }
    setSelectedRoleId(roleId);
  };

  const togglePermission = (code) => {
    setDraftPermissions((prev) => {
      const base = prev ?? permissionsFromDetail(roleDetail);
      const exists = base.find((p) => p.permissionCode === code);
      if (exists) {
        return base.filter((p) => p.permissionCode !== code);
      }
      return [...base, { permissionCode: code, accessScope: DEFAULT_ACCESS_SCOPE }];
    });
  };

  const changeScope = (code, scope) => {
    setDraftPermissions((prev) => {
      const base = prev ?? permissionsFromDetail(roleDetail);
      return base.map((p) =>
        p.permissionCode === code ? { ...p, accessScope: scope } : p,
      );
    });
  };

  const toggleModule = (entries, enabled) => {
    setDraftPermissions((prev) => {
      const base = prev ?? permissionsFromDetail(roleDetail);
      const codes = entries.map((e) => e.permissionCode);
      if (enabled) {
        const merged = new Map(base.map((p) => [p.permissionCode, p]));
        for (const entry of entries) {
          if (!merged.has(entry.permissionCode)) {
            merged.set(entry.permissionCode, entry);
          }
        }
        return [...merged.values()];
      }
      return base.filter((p) => !codes.includes(p.permissionCode));
    });
  };

  const handleCreate = async (payload) => {
    const created = await createMutation.mutateAsync(payload);
    setSelectedRoleId(created.id);
    setCreateWarning(created.warning ?? '');
    await refreshSession?.();
  };

  const handleClone = async (payload) => {
    if (!cloneSource) return;
    const cloned = await cloneMutation.mutateAsync({
      roleId: cloneSource.id,
      ...payload,
    });
    setSelectedRoleId(cloned.id);
    setCloneSource(null);
    await refreshSession?.();
  };

  const handleDeactivate = (role) => {
    setConfirmDialog({
      open: true,
      title: 'Deactivate role?',
      message: `Deactivate role "${role.name}"? This cannot be undone while employees are assigned.`,
      confirmLabel: 'Deactivate',
      confirmColor: 'error',
      onConfirm: async () => {
        setConfirmDialog((d) => ({ ...d, open: false }));
        await deactivateMutation.mutateAsync(role.id);
        if (effectiveSelectedId === role.id) {
          setSelectedRoleId('');
          setDraftPermissions(null);
        }
        await refreshSession?.();
      },
    });
  };

  const handleEditRole = async (payload) => {
    if (!effectiveSelectedId) return;
    await updateRoleMutation.mutateAsync({
      roleId: effectiveSelectedId,
      ...payload,
    });
    await refreshSession?.();
  };

  if (rolesLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={480} />
      </Box>
    );
  }

  return (
    <Box>
      {createWarning && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setCreateWarning('')}>
          {createWarning}
        </Alert>
      )}

      {roles.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No roles found. Create a custom role or contact your administrator.
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 480,
          gap: { xs: 2, md: 0 },
        }}
      >
        <RoleCatalogPanel
          roles={roles}
          selectedRoleId={effectiveSelectedId}
          onSelect={handleRoleSelect}
          onClone={(role) => setCloneSource(role)}
          onDeactivate={handleDeactivate}
          canManage={canManage}
        />

        <Box sx={{ flex: 1, minWidth: 0, pl: { md: 3 } }}>
          <RoleDetailPanel
            roleDetail={roleDetail}
            roleLoading={roleLoading}
            permissions={permissions}
            activePermissions={activePermissions}
            permissionSearch={permissionSearch}
            onPermissionSearchChange={setPermissionSearch}
            enabledOnly={enabledOnly}
            onEnabledOnlyChange={setEnabledOnly}
            enabledCount={enabledCount}
            totalCount={totalCount}
            moduleCount={moduleCount}
            onToggle={togglePermission}
            onScopeChange={changeScope}
            onToggleModule={toggleModule}
            canManage={canManage}
            onEditRole={() => setEditRoleOpen(true)}
          />
        </Box>
      </Box>

      <CreateRoleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <CloneRoleDialog
        open={Boolean(cloneSource)}
        sourceRole={cloneSource}
        onClose={() => setCloneSource(null)}
        onSubmit={handleClone}
        isPending={cloneMutation.isPending}
      />

      <EditRoleDialog
        open={editRoleOpen}
        role={roleDetail}
        onClose={() => setEditRoleOpen(false)}
        onSubmit={handleEditRole}
        isPending={updateRoleMutation.isPending}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmColor={confirmDialog.confirmColor}
        isPending={deactivateMutation.isPending}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => {
          setConfirmDialog((d) => ({ ...d, open: false }));
        }}
      />
    </Box>
  );
}
