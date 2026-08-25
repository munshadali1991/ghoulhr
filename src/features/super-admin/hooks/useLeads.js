import { useQuery } from '@tanstack/react-query';
import { listLeads } from '@/features/super-admin/api/leadsApi';

export const leadsQueryKeys = {
  list: (params) => ['leads', 'list', params],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   source?: 'all' | 'contact_us' | 'request_for_demo',
 * }} [params]
 */
export function useLeads(params = {}) {
  return useQuery({
    queryKey: leadsQueryKeys.list(params),
    queryFn: () => listLeads(params),
    placeholderData: (previous) => previous,
  });
}
