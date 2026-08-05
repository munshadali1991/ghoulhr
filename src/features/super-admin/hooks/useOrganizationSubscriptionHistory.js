import { useQuery } from '@tanstack/react-query';
import { getOrganizationSubscriptionHistory } from '@/features/super-admin/api/subscriptionsApi';

export const subscriptionQueryKeys = {
  current: (organizationId) => ['subscriptions', 'current', organizationId],
  history: (organizationId, params) => [
    'subscriptions',
    'history',
    organizationId,
    params,
  ],
};

/**
 * @param {string} organizationId
 * @param {{ page?: number, limit?: number, status?: string, refreshKey?: number }} [params]
 */
export function useOrganizationSubscriptionHistory(organizationId, params = {}) {
  const { refreshKey, ...apiParams } = params;

  return useQuery({
    queryKey: subscriptionQueryKeys.history(organizationId, {
      ...apiParams,
      refreshKey,
    }),
    queryFn: () => getOrganizationSubscriptionHistory(organizationId, apiParams),
    enabled: Boolean(organizationId),
    placeholderData: (previous) => previous,
  });
}
