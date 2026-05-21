import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendanceSettings, updateAttendanceSettings } from '@/features/settings/api/settingsApi';
import { pickRecordTimestamp } from '@/shared/utils/timestamps';

function normalizeShiftsList(shifts) {
  if (!Array.isArray(shifts)) return shifts;
  return shifts.map((s) => {
    if (typeof s !== 'object' || s === null) return s;
    const createdAt =
      pickRecordTimestamp(s) ||
      pickRecordTimestamp({ createdAt: s.updatedAt ?? s.updated_at });
    return { ...s, createdAt };
  });
}

/**
 * Parse attendance settings data - handle JSON strings and type conversions
 */
function parseSettingsData(data) {
  if (!data || typeof data !== 'object') return {};
  
  const parsed = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      try {
        // Try to parse JSON strings (arrays, objects)
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
  
  // Ensure correct types for specific fields
  if (parsed.shifts && !Array.isArray(parsed.shifts)) {
    parsed.shifts = [parsed.shifts];
  }

  parsed.shifts = normalizeShiftsList(parsed.shifts);
  
  if (parsed.working_days && !Array.isArray(parsed.working_days)) {
    parsed.working_days = [parsed.working_days];
  }
  
  if (parsed.overtime_rules && typeof parsed.overtime_rules === 'string') {
    try {
      parsed.overtime_rules = JSON.parse(parsed.overtime_rules);
    } catch {
      parsed.overtime_rules = {};
    }
  }
  
  if (parsed.allowed_ip_addresses && !Array.isArray(parsed.allowed_ip_addresses)) {
    parsed.allowed_ip_addresses = [parsed.allowed_ip_addresses];
  }
  
  // Ensure numeric fields
  ['grace_period_minutes', 'half_day_threshold_minutes'].forEach(field => {
    if (parsed[field] !== undefined) {
      parsed[field] = Number(parsed[field]);
    }
  });
  
  // Ensure boolean fields
  ['overtime_enabled', 'geo_fencing_enabled'].forEach(field => {
    if (parsed[field] !== undefined) {
      parsed[field] = Boolean(parsed[field]);
    }
  });
  
  return parsed;
}

/**
 * Custom hook for managing attendance settings
 * @param {string} organizationId - Organization ID from session
 */
export function useAttendanceSettings(organizationId) {
  const queryClient = useQueryClient();

  // Create a unique query key that includes organizationId
  const queryKey = ['attendance-settings', organizationId];

  // Fetch attendance settings
  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getAttendanceSettings(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in garbage collection for 10 minutes
  });

  // Mutation for updating attendance settings
  const updateMutation = useMutation({
    mutationFn: (formData) => updateAttendanceSettings(organizationId, formData),
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
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
