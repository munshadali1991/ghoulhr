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
  SELF: "Access only to the employee's own records",
  TEAM: 'Access to direct reports and team members',
  DEPARTMENT: "Access across the employee's department",
  ORGANIZATION: 'Access across the entire organization',
};

/**
 * @param {{
 *   row: { resource: string, resourceLabel: string, permissions: import('@/features/rbac/types/rbac.types').RbacPermission[] },
 *   activeByCode: Map<string, string>,
 *   onToggle: (code: string) => void,
 *   onScopeChange: (code: string, scope: string) => void,
 *   disabled?: boolean,
 *   actionColumnLabels?: string[],
 * }} props
 */
export function PermissionResourceRow({
  row,
  activeByCode,
  onToggle,
  onScopeChange,
  disabled = false,
  actionColumnLabels = [],
}) {
  const activePerms = row.permissions.filter((p) => activeByCode.has(p.code));
  const primaryPerm = activePerms[0];
  const hasAnyActive = activePerms.length > 0;

  const useColumns = actionColumnLabels.length > 0;

  return (
    <Box
      sx={{
        py: 1.25,
        borderTop: 1,
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      {useColumns ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: `1fr repeat(${Math.min(actionColumnLabels.length, 4)}, minmax(72px, 90px)) minmax(120px, 150px)`,
            },
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {row.resourceLabel}
          </Typography>
          {actionColumnLabels.map((label) => {
            const perm = row.permissions.find(
              (p) => (p.actionLabel ?? p.action) === label,
            );
            if (!perm) {
              return <Box key={label} sx={{ display: { xs: 'none', md: 'block' } }} />;
            }
            const isActive = activeByCode.has(perm.code);
            return (
              <Stack
                key={perm.code}
                direction="row"
                alignItems="center"
                justifyContent={{ md: 'center' }}
                spacing={0.5}
              >
                <Switch
                  size="small"
                  checked={isActive}
                  onChange={() => onToggle(perm.code)}
                  disabled={disabled}
                  color="secondary"
                />
                <Typography variant="caption" sx={{ display: { md: 'none' } }}>
                  {label}
                </Typography>
                {perm.description ? (
                  <Tooltip title={perm.description}>
                    <InfoOutlinedIcon
                      sx={{ fontSize: 14, color: 'text.secondary', display: { md: 'none' } }}
                    />
                  </Tooltip>
                ) : null}
              </Stack>
            );
          })}
          {hasAnyActive ? (
            <FormControl size="small" disabled={disabled} fullWidth>
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
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'block' } }} />
          )}
        </Box>
      ) : (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ minWidth: 160 }}>
            <Typography variant="body2" fontWeight={500}>
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
                    color="secondary"
                  />
                  <Typography variant="body2">{label}</Typography>
                  {perm.description ? (
                    <Tooltip title={perm.description}>
                      <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </Tooltip>
                  ) : null}
                </Stack>
              );
            })}
          </Stack>

          {hasAnyActive ? (
            <FormControl
              size="small"
              sx={{ minWidth: { xs: 0, md: 150 }, width: { xs: '100%', md: 'auto' } }}
              disabled={disabled}
            >
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
          ) : null}
        </Stack>
      )}
    </Box>
  );
}
