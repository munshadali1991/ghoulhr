import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeeSettings, updateEmployeeSettings } from '../services/settingsApi';
import { mapEmployeeSettingsToForm } from '../utils/settingsMapper';

const EMPLOYEE_SETTINGS_QUERY_KEY = ['employee-settings'];

/**
 * Custom hook for managing employee settings
 * @param {string} accessToken - User's access token
 * @param {string} organizationId - Organization ID from session
 * @returns {UseEmployeeSettingsReturn}
 */
export function useEmployeeSettings(accessToken, organizationId) {
  const queryClient = useQueryClient();

  // Fetch employee settings
  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: EMPLOYEE_SETTINGS_QUERY_KEY,
    queryFn: () => getEmployeeSettings(accessToken, organizationId),
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in garbage collection for 10 minutes
  });

  // Mutation for updating employee settings
  const updateMutation = useMutation({
    mutationFn: (formData) => updateEmployeeSettings(accessToken, organizationId, formData),
    onSuccess: () => {
      // Invalidate and refetch settings after update
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_SETTINGS_QUERY_KEY });
    },
  });

  // Transform data for form
  const settings = settingsData ? mapEmployeeSettingsToForm(settingsData) : {};

  return {
    settings,
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
