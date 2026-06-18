import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ACCESS_SCOPES } from '@/features/rbac/constants/accessScopes';

const SCOPE_DESCRIPTIONS = {
  SELF: 'Access only to the employee\'s own records',
  TEAM: 'Access to direct reports and team members',
  DEPARTMENT: 'Access across the employee\'s department',
  ORGANIZATION: 'Access across the entire organization',
};

/**
 * @param {{
 *   row: { resource: string, resourceLabel: string, permissions: import('@/features/rbac/types/rbac.types').RbacPermission[] },
 *   activeByCode: Map<string, string>,
 *   onToggle: (code: string) => void,
 *   onScopeChange: (code: string, scope: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function PermissionResourceRow({
  row,
  activeByCode,
  onToggle,
  onScopeChange,
  disabled = false,
}) {
  const activePerms = row.permissions.filter((p) => activeByCode.has(p.code));
  const primaryPerm = activePerms[0];
  const hasAnyActive = activePerms.length > 0;

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ minWidth: 160 }}>
          <Typography variant="body2" fontWeight={600}>
            {row.resourceLabel}
          </Typography>
        </Box>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2} sx={{ flex: 1 }}>
          {row.permissions.map((perm) => {
            const isActive = activeByCode.has(perm.code);
            const label = perm.actionLabel ?? perm.action;
            return (
              <Stack key={perm.code} direction="row" alignItems="center" spacing={0.5}>
                <Switch
                  size="small"
                  checked={isActive}
                  onChange={() => onToggle(perm.code)}
                  disabled={disabled}
                />
                <Typography variant="body2">{label}</Typography>
                {perm.description && (
                  <Tooltip title={perm.description}>
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                )}
              </Stack>
            );
          })}
        </Stack>

        {hasAnyActive && (
          <FormControl size="small" sx={{ minWidth: 150 }} disabled={disabled}>
            <Select
              value={activeByCode.get(primaryPerm.code) ?? 'SELF'}
              onChange={(e) => {
                const scope = e.target.value;
                for (const perm of activePerms) {
                  onScopeChange(perm.code, scope);
                }
              }}
              displayEmpty
            >
              {ACCESS_SCOPES.map((scope) => (
                <MenuItem key={scope.value} value={scope.value}>
                  <Tooltip title={SCOPE_DESCRIPTIONS[scope.value]} placement="left">
                    <span>{scope.label}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Box>
  );
}
