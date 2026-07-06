import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPerformanceMaster,
  updatePerformanceMaster,
} from '../api/performanceMasterApi';

const masterKey = (organizationId) => ['settings', 'performance-master', organizationId];

/**
 * @param {string} organizationId
 */
export function usePerformanceMaster(organizationId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: masterKey(organizationId),
    queryFn: () => getPerformanceMaster(organizationId),
    enabled: Boolean(organizationId),
  });

  const mutation = useMutation({
    mutationFn: (payload) => updatePerformanceMaster(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKey(organizationId) });
    },
  });

  const updateMaster = useCallback(
    (payload) => mutation.mutateAsync(payload),
    [mutation],
  );

  return {
    master: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateMaster,
    isUpdating: mutation.isPending,
    refetch: query.refetch,
  };
}
