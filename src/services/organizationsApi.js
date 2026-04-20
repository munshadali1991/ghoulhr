import { API_BASE_URL } from '../config/appConfig';

async function authorizedRequest(path, accessToken, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && (payload.message?.[0] ?? payload.message ?? payload.error)) ||
      'Request failed. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function listOrganizations(accessToken) {
  return authorizedRequest('/organizations', accessToken);
}

export function createOrganization(accessToken, body) {
  return authorizedRequest('/organizations', accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateOrganization(accessToken, organizationId, body) {
  return authorizedRequest(`/organizations/id/${organizationId}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteOrganization(accessToken, organizationId) {
  return authorizedRequest(`/organizations/id/${organizationId}`, accessToken, {
    method: 'DELETE',
  });
}

export function listDeletedOrganizations(accessToken) {
  return authorizedRequest('/organizations/deleted', accessToken);
}

export function restoreOrganization(accessToken, organizationId) {
  return authorizedRequest(`/organizations/id/${organizationId}/restore`, accessToken, {
    method: 'PATCH',
  });
}

export function getOrganizationById(accessToken, organizationId) {
  return authorizedRequest(`/organizations/id/${organizationId}`, accessToken);
}

export function getSuperAdminDashboardStats(accessToken) {
  return authorizedRequest('/organizations/stats', accessToken);
}
