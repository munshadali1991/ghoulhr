import { useCallback, useMemo, useState } from 'react';
import { useAttendanceSettings } from '@/features/settings/attendance/hooks/useAttendanceSettings';
import { useLocationConfigurations } from '@/features/settings/locations';
import {
  generateShiftId,
  mapShiftsToFormState,
  serializeShiftForApi,
} from '../utils/shifts';

export function useAttendanceManager(organizationId) {
  const {
    settings,
    isLoading: settingsLoading,
    error,
    updateSettings,
    isUpdating,
  } = useAttendanceSettings(organizationId);

  const { locations: branchLocations, isLoading: locationsLoading } =
    useLocationConfigurations(organizationId);

  const [actionError, setActionError] = useState('');

  const firstBranchId = useMemo(
    () =>
      branchLocations.find((l) => l.isActive !== false)?.id ||
      branchLocations[0]?.id ||
      '',
    [branchLocations],
  );

  const shifts = useMemo(() => {
    const raw = settings?.shifts;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return mapShiftsToFormState(raw, firstBranchId);
  }, [settings?.shifts, firstBranchId]);

  const schedule = useMemo(
    () => ({
      working_days: settings?.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      grace_period_minutes: settings?.grace_period_minutes ?? 10,
      half_day_threshold_minutes: settings?.half_day_threshold_minutes ?? 240,
      overtime_enabled: settings?.overtime_enabled ?? false,
      overtime_rules: settings?.overtime_rules || {},
    }),
    [settings],
  );

  const checkIn = useMemo(
    () => ({
      tracking_mode: settings?.tracking_mode || 'manual',
      geo_fencing_enabled: settings?.geo_fencing_enabled ?? false,
      allowed_ip_addresses: settings?.allowed_ip_addresses || [],
    }),
    [settings],
  );

  const persist = useCallback(
    async (patch) => {
      await updateSettings({
        ...settings,
        ...patch,
      });
    },
    [settings, updateSettings],
  );

  const saveShift = useCallback(
    async (payload, existingId) => {
      setActionError('');
      const record = {
        id: existingId || generateShiftId(),
        ...payload,
      };

      const nextShifts = existingId
        ? shifts.map((s) => (s.id === existingId ? { ...s, ...record } : s))
        : [...shifts, record];

      if (nextShifts.length === 0) {
        throw new Error('At least one shift is required.');
      }

      for (let i = 0; i < nextShifts.length; i += 1) {
        if (!nextShifts[i].locationId?.trim()) {
          throw new Error(`Select a branch for shift ${i + 1} (Settings → Locations).`);
        }
      }

      try {
        await persist({
          shifts: nextShifts.map(serializeShiftForApi),
        });
        return record;
      } catch (err) {
        setActionError(err.message || 'Failed to save shift.');
        throw err;
      }
    },
    [persist, shifts],
  );

  const deleteShift = useCallback(
    async (shiftId) => {
      setActionError('');
      const nextShifts = shifts.filter((s) => s.id !== shiftId);
      if (nextShifts.length === 0) {
        setActionError('At least one shift must remain. Edit the shift instead of deleting the last one.');
        throw new Error('Cannot delete the last shift.');
      }

      try {
        await persist({
          shifts: nextShifts.map(serializeShiftForApi),
        });
      } catch (err) {
        setActionError(err.message || 'Failed to delete shift.');
        throw err;
      }
    },
    [persist, shifts],
  );

  const saveSchedule = useCallback(
    async (payload) => {
      setActionError('');
      try {
        await persist(payload);
      } catch (err) {
        setActionError(err.message || 'Failed to save schedule settings.');
        throw err;
      }
    },
    [persist],
  );

  const saveCheckIn = useCallback(
    async (payload) => {
      setActionError('');
      try {
        await persist(payload);
      } catch (err) {
        setActionError(err.message || 'Failed to save check-in settings.');
        throw err;
      }
    },
    [persist],
  );

  return {
    shifts,
    schedule,
    checkIn,
    branchLocations,
    firstBranchId,
    isLoading: settingsLoading || locationsLoading,
    isSaving: isUpdating,
    error,
    actionError,
    clearActionError: () => setActionError(''),
    saveShift,
    deleteShift,
    saveSchedule,
    saveCheckIn,
  };
}
