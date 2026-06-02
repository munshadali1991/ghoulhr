import { useMemo } from 'react';
import { useAttendanceSettings } from '@/features/settings/attendance/hooks/useAttendanceSettings';
import { useLocationConfigurations } from '@/features/settings/locations';
import { mapShiftsToFormState } from '@/features/settings/attendance/utils/shifts';
export function useEmploymentLocationShifts(organizationId) {
  const { locations, isLoading: locationsLoading } = useLocationConfigurations(organizationId);
  const { settings, isLoading: settingsLoading } = useAttendanceSettings(organizationId);

  const activeLocations = useMemo(
    () =>
      (Array.isArray(locations) ? locations : []).filter(
        (l) => l?.id && l?.isActive !== false && String(l.name || '').trim(),
      ),
    [locations],
  );

  const firstBranchId = useMemo(
    () => activeLocations[0]?.id || '',
    [activeLocations],
  );

  const shifts = useMemo(() => {
    const raw = settings?.shifts;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return mapShiftsToFormState(raw, firstBranchId);
  }, [settings?.shifts, firstBranchId]);

  return {
    activeLocations,
    shifts,
    isLoading: locationsLoading || settingsLoading,
  };
}
