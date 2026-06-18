import { apiFetch } from '@/shared/api/httpClient';

export function listRbacRoles() {
  return apiFetch('/rbac/roles');
}

export function listRbacPermissions() {
  return apiFetch('/rbac/permissions');
}

export function getRbacRole(roleId) {
  return apiFetch(`/rbac/roles/${roleId}`);
}

export function createRbacRole({ name, description }) {
  return apiFetch('/rbac/roles', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export function updateRbacRole(roleId, { name, description }) {
  return apiFetch(`/rbac/roles/${roleId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description }),
  });
}

export function deactivateRbacRole(roleId) {
  return apiFetch(`/rbac/roles/${roleId}/deactivate`, {
    method: 'PATCH',
  });
}

export function cloneRbacRole(roleId, { name, description }) {
  return apiFetch(`/rbac/roles/${roleId}/clone`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export function updateRolePermissions(roleId, permissions) {
  return apiFetch(`/rbac/roles/${roleId}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({ permissions }),
  });
}

export function getEmployeeRoles(employeeId) {
  return apiFetch(`/rbac/employees/${employeeId}/roles`);
}

export function assignEmployeeRoles(employeeId, roleIds, primaryRoleId) {
  return apiFetch(`/rbac/employees/${employeeId}/roles`, {
    method: 'PATCH',
    body: JSON.stringify({ roleIds, primaryRoleId }),
  });
}

/**
 * @param {{ page?: number, limit?: number, action?: string }} [params]
 */
export function listRbacAuditLogs(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.action) search.set('action', params.action);
  const qs = search.toString();
  return apiFetch(`/rbac/audit-logs${qs ? `?${qs}` : ''}`);
}

export function getOrganizationModules(organizationId) {
  return apiFetch(`/organizations/id/${organizationId}/modules`);
}

export function setOrganizationModules(organizationId, enabledModuleCodes) {
  return apiFetch(`/organizations/id/${organizationId}/modules`, {
    method: 'PATCH',
    body: JSON.stringify({ enabledModuleCodes }),
  });
}
