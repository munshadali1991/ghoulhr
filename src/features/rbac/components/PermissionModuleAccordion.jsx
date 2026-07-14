import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { buildPermissionMatrix } from '@/features/rbac/utils/permissionMatrix';
import { DEFAULT_ACCESS_SCOPE } from '@/features/rbac/constants/accessScopes';
import { PermissionResourceRow } from '@/features/rbac/components/PermissionResourceRow';

/**
 * Progress ring for module enablement (secondary fill on divider track).
 * @param {{ enabled: number, total: number }} props
 */
function ModuleProgressRing({ enabled, total }) {
  const pct = total === 0 ? 0 : Math.round((enabled / total) * 100);
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        flexShrink: 0,
        background:
          pct === 0
            ? (t) => t.palette.divider
            : pct === 100
              ? (t) => t.palette.secondary.main
              : (t) =>
                  `conic-gradient(${t.palette.secondary.main} ${pct}%, ${t.palette.divider} ${pct}% 100%)`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          bgcolor: 'background.paper',
        },
      }}
    />
  );
}

/**
 * @param {{
 *   permissions: import('@/features/rbac/types/rbac.types').RbacPermission[],
 *   activePermissions: Array<{ permissionCode: string, accessScope: string }>,
 *   search: string,
 *   enabledOnly: boolean,
 *   onToggle: (code: string) => void,
 *   onScopeChange: (code: string, scope: string) => void,
 *   onToggleModule: (entries: Array<{ permissionCode: string, accessScope: string }>, enabled: boolean) => void,
 *   disabled?: boolean,
 * }} props
 */
export function PermissionModuleAccordion({
  permissions,
  activePermissions,
  search,
  enabledOnly,
  onToggle,
  onScopeChange,
  onToggleModule,
  disabled = false,
}) {
  const matrix = useMemo(() => buildPermissionMatrix(permissions), [permissions]);
  const activeByCode = useMemo(
    () => new Map(activePermissions.map((p) => [p.permissionCode, p.accessScope])),
    [activePermissions],
  );
  const activeCodes = useMemo(() => [...activeByCode.keys()], [activeByCode]);

  const [expandedModules, setExpandedModules] = useState(() =>
    matrix.length > 0 ? [matrix[0].moduleCode] : [],
  );

  const q = search.trim().toLowerCase();

  const filteredMatrix = useMemo(() => {
    return matrix
      .map((mod) => {
        const rows = mod.rows.filter((row) => {
          const rowMatchesSearch =
            !q ||
            row.resourceLabel.toLowerCase().includes(q) ||
            row.permissions.some(
              (p) =>
                p.code.toLowerCase().includes(q) ||
                (p.description ?? '').toLowerCase().includes(q) ||
                (p.actionLabel ?? p.action).toLowerCase().includes(q),
            );
          const rowHasEnabled = row.permissions.some((p) => activeCodes.includes(p.code));
          const rowMatchesEnabled = !enabledOnly || rowHasEnabled;
          return rowMatchesSearch && rowMatchesEnabled;
        });
        return { ...mod, rows };
      })
      .filter((mod) => mod.rows.length > 0);
  }, [matrix, q, enabledOnly, activeCodes]);

  const handleAccordionChange = (moduleCode) => (_, isExpanded) => {
    setExpandedModules((prev) =>
      isExpanded ? [...prev, moduleCode] : prev.filter((c) => c !== moduleCode),
    );
  };

  if (permissions.length === 0) {
    return (
      <Typography color="text.secondary">
        No permissions available for modules enabled in your organization.
      </Typography>
    );
  }

  if (filteredMatrix.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No permissions match your filters.
      </Typography>
    );
  }

  return (
    <Box>
      {filteredMatrix.map((mod) => {
        const moduleEntries = mod.rows.flatMap((row) =>
          row.permissions.map((p) => ({
            permissionCode: p.code,
            accessScope: activeByCode.get(p.code) ?? DEFAULT_ACCESS_SCOPE,
          })),
        );
        const moduleCodes = moduleEntries.map((e) => e.permissionCode);
        const enabledInModule = moduleCodes.filter((c) => activeCodes.includes(c)).length;
        const allSelected = moduleCodes.length > 0 && moduleCodes.every((c) => activeCodes.includes(c));
        const someSelected = moduleCodes.some((c) => activeCodes.includes(c));

        const actionLabels = [
          ...new Set(
            mod.rows.flatMap((row) =>
              row.permissions.map((p) => p.actionLabel ?? p.action),
            ),
          ),
        ];

        return (
          <Accordion
            key={mod.moduleCode}
            expanded={expandedModules.includes(mod.moduleCode)}
            onChange={handleAccordionChange(mod.moduleCode)}
            disableGutters
            elevation={0}
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              borderRadius: '0 !important',
              bgcolor: 'transparent',
              '&:before': { display: 'none' },
              '&:first-of-type': { borderTop: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'text.disabled' }} />}
              sx={{
                px: 0.5,
                minHeight: 52,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  my: 1.5,
                  gap: 1.5,
                },
              }}
            >
              <ModuleProgressRing enabled={enabledInModule} total={moduleCodes.length} />
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                {mod.moduleName}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.disabled"
                  sx={{ ml: 0.75, fontWeight: 500 }}
                >
                  ({enabledInModule}/{moduleCodes.length} enabled)
                </Typography>
              </Typography>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                color="secondary"
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleModule(moduleEntries, !allSelected);
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={disabled}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0.5, pt: 0, pb: 2, pl: { sm: 5.25 } }}>
              {actionLabels.length > 0 ? (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: `1fr repeat(${Math.min(actionLabels.length, 4)}, minmax(72px, 90px)) minmax(120px, 150px)`,
                    gap: 1,
                    pb: 1,
                  }}
                >
                  <Box />
                  {actionLabels.slice(0, 4).map((label) => (
                    <Typography
                      key={label}
                      variant="caption"
                      color="text.disabled"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                      }}
                    >
                      {label}
                    </Typography>
                  ))}
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Scope
                  </Typography>
                </Box>
              ) : null}
              {mod.rows.map((row) => (
                <PermissionResourceRow
                  key={row.resource}
                  row={row}
                  activeByCode={activeByCode}
                  onToggle={onToggle}
                  onScopeChange={onScopeChange}
                  disabled={disabled}
                  actionColumnLabels={actionLabels.slice(0, 4)}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
