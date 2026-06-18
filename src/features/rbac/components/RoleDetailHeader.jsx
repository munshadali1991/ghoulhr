import { Alert, Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

/**
 * @param {{
 *   roleDetail: import('@/features/rbac/types/rbac.types').RbacRoleDetail,
 *   canManage: boolean,
 *   onEdit: () => void,
 * }} props
 */
export function RoleDetailHeader({ roleDetail, canManage, onEdit }) {
  const canEditMetadata = canManage && roleDetail.isEditable && !roleDetail.isSystem;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography variant="h6" fontWeight={700}>
              {roleDetail.name}
            </Typography>
            <Chip
              label={roleDetail.isSystem ? 'System' : 'Custom'}
              size="small"
              color={roleDetail.isSystem ? 'default' : 'primary'}
              variant="outlined"
            />
            <Chip label="Active" size="small" color="success" variant="outlined" />
            {canEditMetadata && (
              <Tooltip title="Edit role name and description">
                <IconButton size="small" onClick={onEdit}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {roleDetail.code}
            {roleDetail.description ? ` · ${roleDetail.description}` : ''}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${roleDetail.permissionCount ?? 0} permissions`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${roleDetail.assignedEmployeeCount ?? 0} employees assigned`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
      </Stack>

      {!roleDetail.isEditable && (
        <Alert severity="info" sx={{ mt: 2 }}>
          This system role has fixed permissions and cannot be modified.
        </Alert>
      )}
    </Box>
  );
}
