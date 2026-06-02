import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTimesheetSettings,
  updateTimesheetSettings,
} from '@/features/settings/api/settingsApi';

const timesheetSettingsKey = (organizationId) => ['settings', 'timesheet', organizationId];

/**
 * @param {string} organizationId
 */
export function useTimesheetSettings(organizationId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: timesheetSettingsKey(organizationId),
    queryFn: () => getTimesheetSettings(organizationId),
    enabled: Boolean(organizationId),
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateTimesheetSettings(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timesheetSettingsKey(organizationId) });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
