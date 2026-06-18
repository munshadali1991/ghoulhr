/**
 * Build a module-grouped permission matrix from flat catalog entries.
 * @param {import('@/features/rbac/types/rbac.types').RbacPermission[]} permissions
 */
export function buildPermissionMatrix(permissions) {
  /** @type {Map<string, { moduleCode: string, moduleName: string, rows: Map<string, import('@/features/rbac/types/rbac.types').RbacPermission[]> }>} */
  const modules = new Map();

  for (const perm of permissions) {
    const moduleCode = perm.moduleCode ?? 'other';
    const moduleName = perm.moduleName ?? moduleCode;
    if (!modules.has(moduleCode)) {
      modules.set(moduleCode, { moduleCode, moduleName, rows: new Map() });
    }
    const mod = modules.get(moduleCode);
    const resource = perm.resource ?? perm.code.split(':')[0];
    const resourceLabel = formatResourceLabel(resource);
    if (!mod.rows.has(resource)) {
      mod.rows.set(resource, { resource, resourceLabel, permissions: [] });
    }
    mod.rows.get(resource).permissions.push(perm);
  }

  return [...modules.values()].map((mod) => ({
    ...mod,
    rows: [...mod.rows.values()].sort((a, b) =>
      a.resourceLabel.localeCompare(b.resourceLabel),
    ),
  }));
}

function formatResourceLabel(resource) {
  const labels = {
    employees: 'Employees',
    'settings.organization': 'Organization profile',
    'settings.employees': 'Employee settings',
    'settings.attendance': 'Attendance settings',
    'settings.timesheet': 'Timesheet settings',
    'settings.locations': 'Locations',
    'settings.leave': 'Leave settings',
    'ess.leave': 'ESS Leave',
    'ess.attendance': 'ESS Attendance',
    'ess.timesheet': 'ESS Timesheet',
    'approvals.leave': 'Leave approvals',
    'approvals.timesheet': 'Timesheet approvals',
    payroll: 'Payroll',
    rbac: 'Roles & Permissions',
  };
  return labels[resource] ?? resource.replace(/\./g, ' / ').replace(/-/g, ' ');
}

/**
 * Collect unique action columns across all permissions, ordered.
 * @param {import('@/features/rbac/types/rbac.types').RbacPermission[]} permissions
 */
export function collectActionColumns(permissions) {
  const order = [
    'read',
    'create',
    'update',
    'write',
    'onboard',
    'assign',
    'apply',
    'punch',
    'act',
    'run',
    'manage',
    'reset-password',
  ];
  const actions = new Set(permissions.map((p) => p.action));
  const ordered = order.filter((a) => actions.has(a));
  const rest = [...actions].filter((a) => !order.includes(a)).sort();
  return [...ordered, ...rest].map((action) => ({
    action,
    label:
      permissions.find((p) => p.action === action)?.actionLabel ??
      action.charAt(0).toUpperCase() + action.slice(1),
  }));
}

/**
 * @param {{ resource: string, permissions: import('@/features/rbac/types/rbac.types').RbacPermission[] }} row
 * @param {string} action
 */
export function permissionForCell(row, action) {
  return row.permissions.find((p) => p.action === action);
}
