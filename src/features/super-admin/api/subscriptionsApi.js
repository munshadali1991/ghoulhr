import { apiFetch } from '@/shared/api/httpClient';

function normalizeSubscriptionHistoryResponse(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page: 1,
      limit: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
    };
  }
  return payload;
}

export function getOrganizationSubscription(organizationId) {
  return apiFetch(`/organizations/id/${organizationId}/subscription`);
}

export function getOrganizationSubscriptionHistory(
  organizationId,
  { page = 1, limit = 10, status } = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) {
    params.set('status', status);
  }
  return apiFetch(`/organizations/id/${organizationId}/subscriptions?${params}`).then(
    normalizeSubscriptionHistoryResponse,
  );
}

export function assignOrganizationSubscription(organizationId, body) {
  return apiFetch(`/organizations/id/${organizationId}/subscription`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function renewOrganizationSubscription(organizationId, body) {
  return apiFetch(`/organizations/id/${organizationId}/subscription/renew`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
