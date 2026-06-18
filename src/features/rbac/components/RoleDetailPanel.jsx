import { Box, CircularProgress, Typography } from '@mui/material';
import { RoleDetailHeader } from '@/features/rbac/components/RoleDetailHeader';
import { PermissionEditorToolbar } from '@/features/rbac/components/PermissionEditorToolbar';
import { PermissionModuleAccordion } from '@/features/rbac/components/PermissionModuleAccordion';

/**
 * @param {{
 *   roleDetail: import('@/features/rbac/types/rbac.types').RbacRoleDetail | undefined,
 *   roleLoading: boolean,
 *   permissions: import('@/features/rbac/types/rbac.types').RbacPermission[],
 *   activePermissions: Array<{ permissionCode: string, accessScope: string }>,
 *   permissionSearch: string,
 *   onPermissionSearchChange: (value: string) => void,
 *   enabledOnly: boolean,
 *   onEnabledOnlyChange: (value: boolean) => void,
 *   enabledCount: number,
 *   totalCount: number,
 *   moduleCount: number,
 *   onToggle: (code: string) => void,
 *   onScopeChange: (code: string, scope: string) => void,
 *   onToggleModule: (entries: Array<{ permissionCode: string, accessScope: string }>, enabled: boolean) => void,
 *   canManage: boolean,
 *   onEditRole: () => void,
 * }} props
 */
export function RoleDetailPanel({
  roleDetail,
  roleLoading,
  permissions,
  activePermissions,
  permissionSearch,
  onPermissionSearchChange,
  enabledOnly,
  onEnabledOnlyChange,
  enabledCount,
  totalCount,
  moduleCount,
  onToggle,
  onScopeChange,
  onToggleModule,
  canManage,
  onEditRole,
}) {
  if (roleLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!roleDetail) {
    return (
      <Typography color="text.secondary" sx={{ py: 4 }}>
        Select a role to view and edit permissions.
      </Typography>
    );
  }

  const disabled = !canManage || !roleDetail.isEditable;

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <RoleDetailHeader
        roleDetail={roleDetail}
        canManage={canManage}
        onEdit={onEditRole}
      />

      <PermissionEditorToolbar
        search={permissionSearch}
        onSearchChange={onPermissionSearchChange}
        enabledOnly={enabledOnly}
        onEnabledOnlyChange={onEnabledOnlyChange}
        enabledCount={enabledCount}
        totalCount={totalCount}
        moduleCount={moduleCount}
      />

      <PermissionModuleAccordion
        permissions={permissions}
        activePermissions={activePermissions}
        search={permissionSearch}
        enabledOnly={enabledOnly}
        onToggle={onToggle}
        onScopeChange={onScopeChange}
        onToggleModule={onToggleModule}
        disabled={disabled}
      />
    </Box>
  );
}
