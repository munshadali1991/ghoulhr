import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrgProfile, updateOrgProfile } from '../services/settingsApi';

/**
 * Parse settings data - convert JSON strings to objects/arrays
 * Handles edge cases where backend returns stringified values
 */
function parseSettingsData(data) {
  if (!data || typeof data !== 'object') return {};
  
  const parsed = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      try {
        // Try to parse JSON strings (arrays, objects, booleans, numbers)
        const parsedValue = JSON.parse(value);
        parsed[key] = parsedValue;
      } catch {
        // If parsing fails, keep as string
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  });
  
  return parsed;
}

/**
 * Custom hook for managing organization settings
 * @param {string} organizationId - Organization ID from session
 */
export function useSettings(organizationId) {
  const queryClient = useQueryClient();

  // Create a unique query key that includes organizationId
  const queryKey = ['settings', organizationId];

  // Fetch settings using profile endpoint (returns mapped object)
  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getOrgProfile(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in garbage collection for 10 minutes
  });

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: (formData) => updateOrgProfile(organizationId, formData),
    onSuccess: () => {
      // Refetch to get the latest data from server
      queryClient.invalidateQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });

  // Transform data for form - parse any JSON strings
  const settings = settingsData ? parseSettingsData(settingsData) : {};

  return {
    settings,
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
