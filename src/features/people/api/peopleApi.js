import { apiFetch } from '@/shared/api/httpClient';

/**
 * @param {{
 *   view: 'everyone' | 'team',
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   departmentId?: string,
 *   designationId?: string,
 *   status?: string,
 *   includeAllStatuses?: boolean,
 * }} params
 */
export function listPeople(params) {
  const qs = new URLSearchParams();
  qs.set('view', params.view);
  if (params.page != null) qs.set('page', String(params.page));
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.search?.trim()) qs.set('search', params.search.trim());
  if (params.departmentId) qs.set('departmentId', params.departmentId);
  if (params.designationId) qs.set('designationId', params.designationId);
  if (params.includeAllStatuses) {
    qs.set('includeAllStatuses', 'true');
  } else if (params.status) {
    qs.set('status', params.status);
  }
  return apiFetch(`/people?${qs.toString()}`, { method: 'GET' });
}

/**
 * @param {string} employeeId
 */
export function getPersonById(employeeId) {
  return apiFetch(`/people/${employeeId}`, { method: 'GET' });
}

export function getPeopleFilterOptions() {
  return apiFetch('/people/filter-options', { method: 'GET' });
}
