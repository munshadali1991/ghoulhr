import { apiFetch } from '@/shared/api/httpClient';

export async function fetchMyAssessments() {
  return apiFetch('/ess/performance/assessments');
}

/**
 * @param {{ status?: string, search?: string }} [params]
 */
export async function fetchReviewAssessments(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const query = qs.toString();
  return apiFetch(
    `/ess/performance/assessments/reviews${query ? `?${query}` : ''}`,
  );
}

/**
 * @param {{
 *   employeeId: string,
 *   cycleLabel: string,
 *   description?: string,
 *   dueDate?: string,
 *   templateKey?: string,
 *   alignManagerEmployeeId?: string,
 * }} payload
 */
export async function createAssessment(payload) {
  return apiFetch('/ess/performance/assessments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * @param {string} id assessment id
 */
export async function fetchAssessment(id) {
  return apiFetch(`/ess/performance/assessments/${encodeURIComponent(id)}`);
}

/**
 * @param {string} id
 * @param {{ answers: object[] }} payload
 */
export async function saveAssessmentDraft(id, payload) {
  return apiFetch(`/ess/performance/assessments/${encodeURIComponent(id)}/draft`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * @param {string} id
 * @param {{ answers: object[] }} payload
 */
export async function submitAssessment(id, payload) {
  return apiFetch(`/ess/performance/assessments/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * @param {string} id
 * @param {{ answers: object[], complete?: boolean }} payload
 */
export async function saveManagerReview(id, payload) {
  return apiFetch(
    `/ess/performance/assessments/${encodeURIComponent(id)}/manager-review`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

/**
 * @param {string} id
 * @param {{ answers: object[], complete?: boolean }} payload
 */
export async function saveHrReview(id, payload) {
  return apiFetch(
    `/ess/performance/assessments/${encodeURIComponent(id)}/hr-review`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

/**
 * @param {string} id
 * @param {string} roleCode RBAC role code for the section being reviewed
 * @param {{ answers: object[], complete?: boolean }} payload
 */
export async function saveRoleReview(id, roleCode, payload) {
  return apiFetch(
    `/ess/performance/assessments/${encodeURIComponent(id)}/role-review/${encodeURIComponent(roleCode)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}
