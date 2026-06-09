import { apiFetch } from '@/shared/api/httpClient';

function settingsFetch(path, organizationId, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: {
      'x-org-id': organizationId,
      ...(options.headers ?? {}),
    },
  });
}

export function getTimesheetCategories(organizationId) {
  return settingsFetch('/settings/timesheet/categories', organizationId);
}

export function createTimesheetCategory(organizationId, payload) {
  return settingsFetch('/settings/timesheet/categories', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTimesheetCategory(organizationId, id, payload) {
  return settingsFetch(`/settings/timesheet/categories/${id}`, organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTimesheetCategory(organizationId, id) {
  return settingsFetch(`/settings/timesheet/categories/${id}`, organizationId, {
    method: 'DELETE',
  });
}
