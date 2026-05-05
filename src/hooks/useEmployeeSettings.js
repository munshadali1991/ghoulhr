import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeeSettings, updateEmployeeSettings } from '../services/settingsApi';

/**
 * Parse employee settings data - handle JSON strings and type conversions
 */
function parseEmployeeSettings(data) {
  if (!data || typeof data !== 'object') return {};
  
  const parsed = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      try {
        // Try to parse JSON strings
        const parsedValue = JSON.parse(value);
        parsed[key] = parsedValue;
      } catch {
        // Keep as string if parsing fails
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  });
  
  // Ensure correct types
  if (parsed.required_fields && !Array.isArray(parsed.required_fields)) {
    parsed.required_fields = [parsed.required_fields];
  }
  
  if (parsed.auto_generate_id !== undefined) {
    parsed.auto_generate_id = Boolean(parsed.auto_generate_id);
  }
  
  if (parsed.default_probation_period !== undefined) {
    parsed.default_probation_period = Number(parsed.default_probation_period);
  }
  
  return parsed;
}

/**
 * Custom hook for managing employee settings
 * @param {string} organizationId - Organization ID from session
 */
export function useEmployeeSettings(organizationId) {
  const queryClient = useQueryClient();

  // Create a unique query key that includes organizationId
  const queryKey = ['employee-settings', organizationId];

  // Fetch employee settings
  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getEmployeeSettings(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in garbage collection for 10 minutes
  });

  // Mutation for updating employee settings
  const updateMutation = useMutation({
    mutationFn: (formData) => updateEmployeeSettings(organizationId, formData),
    onSuccess: () => {
      // Refetch to get the latest data from server
      queryClient.invalidateQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    },
  });

  // Transform data for form - parse and validate types
  const settings = settingsData ? parseEmployeeSettings(settingsData) : {};

  return {
    settings,
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
