import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeaveConfigurations, updateLeaveConfigurations } from '@/features/settings/api/settingsApi';

const queryKeyRoot = 'leave-configurations';

export function useLeaveConfigurations(organizationId) {
  const queryClient = useQueryClient();
  const queryKey = [queryKeyRoot, organizationId];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => getLeaveConfigurations(organizationId),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateLeaveConfigurations(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });

  const leaves = Array.isArray(data?.leaves) ? data.leaves : [];

  return {
    leaves,
    isLoading,
    error: error || updateMutation.error,
    updateLeaves: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
