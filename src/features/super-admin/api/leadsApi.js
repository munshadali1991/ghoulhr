import { apiFetch } from '@/shared/api/httpClient';

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   source?: 'all' | 'contact_us' | 'request_for_demo',
 * }} [params]
 */
export function listLeads({
  page = 1,
  limit = 10,
  search = '',
  source = 'all',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }
  if (source && source !== 'all') {
    params.set('source', source);
  }

  return apiFetch(`/leads?${params}`);
}
