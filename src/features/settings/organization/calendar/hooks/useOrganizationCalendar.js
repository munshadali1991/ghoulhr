import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCalendarHoliday,
  deleteCalendarHoliday,
  fetchOrganizationCalendar,
  publishOrganizationCalendar,
  updateCalendarHoliday,
} from '@/features/settings/api/settingsApi';

export function organizationCalendarKey(organizationId, year) {
  return ['organization-calendar', organizationId, year];
}

/**
 * @param {string} organizationId
 * @param {number} year
 */
export function useOrganizationCalendar(organizationId, year) {
  return useQuery({
    queryKey: organizationCalendarKey(organizationId, year),
    queryFn: () => fetchOrganizationCalendar(organizationId, year),
    enabled: Boolean(organizationId && year),
  });
}

/**
 * @param {string} organizationId
 * @param {number} year
 */
export function useOrganizationCalendarMutations(organizationId, year) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: organizationCalendarKey(organizationId, year),
    });
  };

  const createMutation = useMutation({
    mutationFn: (body) => createCalendarHoliday(organizationId, body),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateCalendarHoliday(organizationId, id, body),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCalendarHoliday(organizationId, id),
    onSuccess: invalidate,
  });

  const publishMutation = useMutation({
    mutationFn: () => publishOrganizationCalendar(organizationId, year),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
  };
}
