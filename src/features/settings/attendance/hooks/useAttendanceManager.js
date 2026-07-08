import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAttendanceSettings } from '@/features/settings/attendance/hooks/useAttendanceSettings';
import { useLocationConfigurations } from '@/features/settings/locations';
import {
  generateShiftId,
  mapShiftsToFormState,
  serializeShiftForApi,
} from '../utils/shifts';

function validateShiftLocations(shifts, branchLocations) {
  const validIds = new Set(branchLocations.map((l) => l.id));
  // #region agent log
  fetch('http://127.0.0.1:7359/ingest/507eadee-7b9c-4052-86b9-ecdcc1714ed1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c3971f'},body:JSON.stringify({sessionId:'c3971f',hypothesisId:'A,B,D',location:'useAttendanceManager.js:validate',message:'validateShiftLocations entry',data:{branchCount:branchLocations.length,branchIds:branchLocations.map((l)=>({id:l.id,type:typeof l.id,isActive:l.isActive})),shiftLocationIds:shifts.map((s)=>({raw:s.locationId,type:typeof s.locationId,trimmed:s.locationId?.trim?.()}))},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  for (let i = 0; i < shifts.length; i += 1) {
    const shift = shifts[i];
    const locationId = shift.locationId?.trim();
    if (!locationId) {
      throw new Error(`Select a branch for shift ${i + 1} (Settings → Locations).`);
    }
    if (!validIds.has(locationId)) {
      const name = shift.name?.trim() || `shift ${i + 1}`;
      // #region agent log
      fetch('http://127.0.0.1:7359/ingest/507eadee-7b9c-4052-86b9-ecdcc1714ed1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c3971f'},body:JSON.stringify({sessionId:'c3971f',hypothesisId:'A,D',location:'useAttendanceManager.js:validateFail',message:'validation FAILED - locationId not in validIds',data:{shiftIndex:i,shiftName:name,offendingLocationId:locationId,validIds:[...validIds]},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new Error(
        `Shift "${name}" references a branch that no longer exists. Pick a valid branch or configure it under Settings → Locations first.`,
      );
    }
  }
}

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

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7359/ingest/507eadee-7b9c-4052-86b9-ecdcc1714ed1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c3971f'},body:JSON.stringify({sessionId:'c3971f',hypothesisId:'C,E,A,B',location:'useAttendanceManager.js:hook',message:'hook location/settings state',data:{organizationId:organizationId??null,orgIdType:typeof organizationId,locationsLoading,branchCount:branchLocations.length,branchIds:branchLocations.map((l)=>({id:l.id,isActive:l.isActive})),settingsShiftCount:Array.isArray(settings?.shifts)?settings.shifts.length:null,settingsShiftLocIds:Array.isArray(settings?.shifts)?settings.shifts.map((s)=>s.locationId??s.location_id??null):null},timestamp:Date.now()})}).catch(()=>{});
  }, [organizationId, locationsLoading, branchLocations, settings?.shifts]);
  // #endregion

  const firstBranchId = useMemo(
    () =>
      branchLocations.find((l) => l.isActive !== false)?.id ||
      branchLocations[0]?.id ||
      '',
    [branchLocations],
  );

  const validBranchIds = useMemo(
    () => new Set(branchLocations.map((l) => l.id)),
    [branchLocations],
  );

  const shifts = useMemo(() => {
    const raw = settings?.shifts;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return mapShiftsToFormState(raw, firstBranchId, validBranchIds);
  }, [settings?.shifts, firstBranchId, validBranchIds]);

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
      const payload = { ...patch };
      if (Array.isArray(payload.shifts)) {
        payload.shifts = payload.shifts.map(serializeShiftForApi);
      }
      await updateSettings(payload);
    },
    [updateSettings],
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

      validateShiftLocations(nextShifts, branchLocations);

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
    [branchLocations, persist, shifts],
  );

  const deleteShift = useCallback(
    async (shiftId) => {
      setActionError('');
      const nextShifts = shifts.filter((s) => s.id !== shiftId);
      if (nextShifts.length === 0) {
        setActionError('At least one shift must remain. Edit the shift instead of deleting the last one.');
        throw new Error('Cannot delete the last shift.');
      }

      validateShiftLocations(nextShifts, branchLocations);

      try {
        await persist({
          shifts: nextShifts.map(serializeShiftForApi),
        });
      } catch (err) {
        setActionError(err.message || 'Failed to delete shift.');
        throw err;
      }
    },
    [branchLocations, persist, shifts],
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
