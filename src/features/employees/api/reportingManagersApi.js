import { apiFetch } from '@/shared/api/httpClient';

export function listReportingManagers({ search = '', filter = 'all' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (filter) params.set('filter', filter);
  const qs = params.toString();
  return apiFetch(`/employees/reporting-managers${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });
}

export function getReportingManager(employeeId) {
  return apiFetch(`/employees/${employeeId}/reporting-manager`, {
    method: 'GET',
  });
}

export function assignReportingManager(employeeId, body) {
  return apiFetch(`/employees/${employeeId}/reporting-manager`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function removeReportingManager(employeeId) {
  return apiFetch(`/employees/${employeeId}/reporting-manager`, {
    method: 'DELETE',
  });
}
