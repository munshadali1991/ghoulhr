import { Box, Stack, Typography } from '@mui/material';
import { useRbacPermissions } from '@/features/rbac/hooks/useRbacAdmin';

/**
 * @param {{ before?: Record<string, unknown>, after?: Record<string, unknown>, action: string }} props
 */
export function AuditLogDiff({ before, after, action }) {
  const { data: permissions = [] } = useRbacPermissions();

  const labelForCode = (code) => {
    const perm = permissions.find((p) => p.code === code);
    if (!perm) return code;
    const resource = perm.resource ?? code.split(':')[0];
    const actionLabel = perm.actionLabel ?? perm.action;
    return `${resource} · ${actionLabel}`;
  };

  if (action === 'ROLE_PERMISSIONS_UPDATED') {
    const beforePerms = (before?.permissions ?? []).map((p) => ({
      code: p.code,
      scope: p.accessScope,
    }));
    const afterPerms = (after?.permissions ?? []).map((p) => ({
      code: p.code,
      scope: p.accessScope,
    }));
    const beforeMap = new Map(beforePerms.map((p) => [p.code, p.scope]));
    const afterMap = new Map(afterPerms.map((p) => [p.code, p.scope]));

    const added = afterPerms.filter((p) => !beforeMap.has(p.code));
    const removed = beforePerms.filter((p) => !afterMap.has(p.code));
    const scopeChanged = afterPerms.filter(
      (p) => beforeMap.has(p.code) && beforeMap.get(p.code) !== p.scope,
    );

    return (
      <Box>
        {added.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="success.main" fontWeight={700} display="block">
              Added ({added.length})
            </Typography>
            {added.map((p) => (
              <Typography key={p.code} variant="body2" sx={{ mt: 0.5 }}>
                + {labelForCode(p.code)}
                {p.scope ? ` (${p.scope})` : ''}
              </Typography>
            ))}
          </Box>
        )}
        {removed.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="error.main" fontWeight={700} display="block">
              Removed ({removed.length})
            </Typography>
            {removed.map((p) => (
              <Typography key={p.code} variant="body2" sx={{ mt: 0.5 }}>
                − {labelForCode(p.code)}
              </Typography>
            ))}
          </Box>
        )}
        {scopeChanged.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="warning.main" fontWeight={700} display="block">
              Scope changed ({scopeChanged.length})
            </Typography>
            {scopeChanged.map((p) => (
              <Typography key={p.code} variant="body2" sx={{ mt: 0.5 }}>
                {labelForCode(p.code)}: {beforeMap.get(p.code)} → {p.scope}
              </Typography>
            ))}
          </Box>
        )}
        {added.length === 0 && removed.length === 0 && scopeChanged.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No permission changes detected.
          </Typography>
        )}
      </Box>
    );
  }

  if (action === 'ROLE_UPDATED') {
    const changes = [];
    if (before?.name !== after?.name) {
      changes.push(`Name: ${before?.name ?? '—'} → ${after?.name ?? '—'}`);
    }
    if (before?.description !== after?.description) {
      changes.push(
        `Description: ${before?.description ?? '—'} → ${after?.description ?? '—'}`,
      );
    }
    return (
      <Stack spacing={0.5}>
        {changes.length > 0 ? (
          changes.map((line) => (
            <Typography key={line} variant="body2">
              {line}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No metadata changes detected.
          </Typography>
        )}
      </Stack>
    );
  }

  if (action === 'EMPLOYEE_ROLES_ASSIGNED') {
    const beforeRoles = (before?.assignments ?? []).map((a) => a.role?.name ?? a.roleId);
    const afterRoles = (after?.assignments ?? []).map((a) => a.role?.name ?? a.roleId);
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2">
          <strong>Before:</strong> {beforeRoles.length ? beforeRoles.join(', ') : 'None'}
        </Typography>
        <Typography variant="body2">
          <strong>After:</strong> {afterRoles.length ? afterRoles.join(', ') : 'None'}
        </Typography>
      </Stack>
    );
  }

  if (before || after) {
    return (
      <Stack spacing={1}>
        {before && (
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Before
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', m: 0 }}
            >
              {JSON.stringify(before, null, 2)}
            </Typography>
          </Box>
        )}
        {after && (
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              After
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', m: 0 }}
            >
              {JSON.stringify(after, null, 2)}
            </Typography>
          </Box>
        )}
      </Stack>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary">
      No detail available.
    </Typography>
  );
}
