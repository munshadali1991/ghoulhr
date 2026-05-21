import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocations, updateLocations } from '@/features/settings/api/settingsApi';

const queryKeyRoot = 'location-configurations';

export function useLocationConfigurations(organizationId) {
  const queryClient = useQueryClient();
  const queryKey = [queryKeyRoot, organizationId];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getLocations(organizationId),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateLocations(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });

  const locations = Array.isArray(data?.locations) ? data.locations : [];

  return {
    locations,
    isLoading,
    error: error || updateMutation.error,
    updateLocations: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
