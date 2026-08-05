import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrgProfile, updateOrgProfile } from '@/features/settings/api/settingsApi';
import { serializeOrgProfileForApi } from '@/features/settings/shell/organizationSettings';

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
        const parsedValue = JSON.parse(value);
        parsed[key] = parsedValue;
      } catch {
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

  const queryKey = ['settings', organizationId];

  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getOrgProfile(organizationId),
    enabled: !!organizationId,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (formData) =>
      updateOrgProfile(organizationId, serializeOrgProfileForApi(formData)),
    onSuccess: (_result, variables) => {
      const saved = serializeOrgProfileForApi(variables);
      queryClient.setQueryData(queryKey, (old) => ({
        ...(old && typeof old === 'object' ? old : {}),
        ...saved,
      }));
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const settings = useMemo(
    () => (settingsData ? parseSettingsData(settingsData) : {}),
    [settingsData],
  );

  return {
    settings,
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
