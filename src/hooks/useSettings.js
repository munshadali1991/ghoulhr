import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrgProfile, updateOrgProfile } from '../services/settingsApi';

const SETTINGS_QUERY_KEY = ['settings'];

/**
 * Custom hook for managing organization settings
 * @param {string} accessToken - User's access token
 * @param {string} organizationId - Organization ID from session
 * @returns {UseSettingsReturn}
 */
export function useSettings(accessToken, organizationId) {
  const queryClient = useQueryClient();

  // Fetch settings using profile endpoint (returns mapped object)
  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => getOrgProfile(accessToken, organizationId),
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in garbage collection for 10 minutes
  });

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: (formData) => updateOrgProfile(accessToken, organizationId, formData),
    onSuccess: () => {
      // Invalidate and refetch settings after update
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });

  // Transform data for form
  const settings = settingsData || {};

  return {
    settings,
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
