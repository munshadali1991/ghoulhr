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
        const allSelected = moduleCodes.every((c) => activeCodes.includes(c));
        const someSelected = moduleCodes.some((c) => activeCodes.includes(c));

        return (
          <Accordion
            key={mod.moduleCode}
            expanded={expandedModules.includes(mod.moduleCode)}
            onChange={handleAccordionChange(mod.moduleCode)}
            disableGutters
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: '8px !important',
              mb: 1.5,
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleModule(moduleEntries, !allSelected);
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={disabled}
                sx={{ mr: 1 }}
              />
              <Typography variant="subtitle2" fontWeight={700}>
                {mod.moduleName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({enabledInModule}/{moduleCodes.length} enabled)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {mod.rows.map((row) => (
                <PermissionResourceRow
                  key={row.resource}
                  row={row}
                  activeByCode={activeByCode}
                  onToggle={onToggle}
                  onScopeChange={onScopeChange}
                  disabled={disabled}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
