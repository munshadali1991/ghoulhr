import { apiFetch } from '@/shared/api/httpClient';

function performanceFetch(path, organizationId, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: {
      'x-org-id': organizationId,
      ...(options.headers ?? {}),
    },
  });
}

export function getPerformanceMaster(organizationId) {
  return performanceFetch('/settings/performance/master', organizationId);
}

export function updatePerformanceMaster(organizationId, payload) {
  return performanceFetch('/settings/performance/master', organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
