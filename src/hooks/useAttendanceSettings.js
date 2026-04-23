import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendanceSettings, updateAttendanceSettings } from '../services/settingsApi';

const ATTENDANCE_SETTINGS_QUERY_KEY = ['attendance-settings'];

/**
 * Custom hook for managing attendance settings
 * @param {string} accessToken - User's access token
 * @param {string} organizationId - Organization ID from session
 * @returns {UseAttendanceSettingsReturn}
 */
export function useAttendanceSettings(accessToken, organizationId) {
  const queryClient = useQueryClient();

  // Fetch attendance settings
  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ATTENDANCE_SETTINGS_QUERY_KEY,
    queryFn: () => getAttendanceSettings(accessToken, organizationId),
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in garbage collection for 10 minutes
  });

  // Mutation for updating attendance settings
  const updateMutation = useMutation({
    mutationFn: (formData) => updateAttendanceSettings(accessToken, organizationId, formData),
    onSuccess: () => {
      // Invalidate and refetch settings after update
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SETTINGS_QUERY_KEY });
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
