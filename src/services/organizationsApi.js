import { apiFetch } from './httpClient';

export function listOrganizations() {
  return apiFetch('/organizations');
}

export function createOrganization(body) {
  return apiFetch('/organizations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateOrganization(organizationId, body) {
  return apiFetch(`/organizations/id/${organizationId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteOrganization(organizationId) {
  return apiFetch(`/organizations/id/${organizationId}`, {
    method: 'DELETE',
  });
}

export function listDeletedOrganizations() {
  return apiFetch('/organizations/deleted');
}

export function restoreOrganization(organizationId) {
  return apiFetch(`/organizations/id/${organizationId}/restore`, {
    method: 'PATCH',
  });
}

export function getOrganizationById(organizationId) {
  return apiFetch(`/organizations/id/${organizationId}`);
}

export function getSuperAdminDashboardStats() {
  return apiFetch('/organizations/stats');
}
