import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AuditLogDiff } from '@/features/rbac/components/AuditLogDiff';

const ACTION_LABELS = {
  ROLE_CREATED: 'Role created',
  ROLE_UPDATED: 'Role updated',
  ROLE_DEACTIVATED: 'Role deactivated',
  ROLE_CLONED: 'Role cloned',
  ROLE_PERMISSIONS_UPDATED: 'Permissions updated',
  EMPLOYEE_ROLES_ASSIGNED: 'Employee roles assigned',
};

/**
 * @param {{
 *   open: boolean,
 *   log: import('@/features/rbac/types/rbac.types').RbacAuditLog | null,
 *   onClose: () => void,
 * }} props
 */
export function AuditLogDetailDrawer({ open, log, onClose }) {
  if (!log) return null;

  const actionLabel = ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Audit detail
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {actionLabel}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              When
            </Typography>
            <Typography variant="body2">
              {new Date(log.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Actor
            </Typography>
            <Typography variant="body2">{log.actorName ?? 'System'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Summary
            </Typography>
            <Typography variant="body2">{log.summary}</Typography>
          </Box>
        </Stack>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Changes
        </Typography>
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <AuditLogDiff before={log.before} after={log.after} action={log.action} />
        </Box>
      </Box>
    </Drawer>
  );
}
