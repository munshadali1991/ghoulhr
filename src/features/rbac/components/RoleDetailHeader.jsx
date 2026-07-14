import { Alert, Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { CrudButton } from '@/shared/components/ui/CrudButton';

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
    <Box
      sx={{
        mb: 2.25,
        pb: 2.25,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              {roleDetail.name}
            </Typography>
            <Chip
              label={roleDetail.isSystem ? 'System' : 'Custom'}
              size="small"
              sx={{
                height: 22,
                fontSize: 10.5,
                fontWeight: 700,
                bgcolor: roleDetail.isSystem
                  ? (t) => t.palette.custom?.surfaces?.muted ?? 'action.hover'
                  : (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(96, 165, 250, 0.16)'
                        : 'rgba(59, 130, 246, 0.12)',
                color: roleDetail.isSystem ? 'text.secondary' : 'secondary.main',
                border: 'none',
              }}
            />
            <Chip
              label="Active"
              size="small"
              sx={{
                height: 22,
                fontSize: 10.5,
                fontWeight: 700,
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(52, 211, 153, 0.16)'
                    : 'rgba(16, 185, 129, 0.12)',
                color: 'success.dark',
                border: 'none',
              }}
            />
          </Stack>

          {roleDetail.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, maxWidth: 480, lineHeight: 1.5 }}
            >
              {roleDetail.description}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1.5 }}>
              {roleDetail.code}
            </Typography>
          )}

          <Stack direction="row" spacing={2.25} flexWrap="wrap" useFlexGap>
            <Typography variant="body2" color="text.secondary">
              <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
                {roleDetail.permissionCount ?? 0}
              </Box>{' '}
              permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
                {roleDetail.assignedEmployeeCount ?? 0}
              </Box>{' '}
              employees assigned
            </Typography>
          </Stack>
        </Box>

        {canEditMetadata ? (
          <Tooltip title="Edit role name and description">
            <CrudButton intent="edit" size="small" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
              Edit
            </CrudButton>
          </Tooltip>
        ) : null}
      </Stack>

      {!roleDetail.isEditable ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          This system role has fixed permissions and cannot be modified.
        </Alert>
      ) : null}
    </Box>
  );
}
