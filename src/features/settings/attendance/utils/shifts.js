import { formatDisplayDate, pickRecordTimestamp } from '@/shared/utils/timestamps';
import { shiftTimeRangeTooltip } from '@/shared/utils/shiftTime';
import { ATTENDANCE_CLOCK_STORAGE_KEY } from '../constants';

export function formatOrgDate(value) {
  return formatDisplayDate(value);
}

export function loadAttendanceClockFormat() {
  try {
    const v = localStorage.getItem(ATTENDANCE_CLOCK_STORAGE_KEY);
    if (v === '12' || v === '24') return v;
  } catch {
    /* ignore */
  }
  return '12';
}

export function saveAttendanceClockFormat(value) {
  try {
    localStorage.setItem(ATTENDANCE_CLOCK_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function defaultShiftTemplate(locationId = '') {
  return {
    name: 'Morning Shift',
    start_time: '09:00',
    end_time: '18:00',
    break_minutes: 60,
    locationId,
  };
}

export function mapShiftsToFormState(shifts, defaultLocationId = '') {
  const list =
    Array.isArray(shifts) && shifts.length > 0
      ? shifts
      : [defaultShiftTemplate(defaultLocationId)];

  return list.map((s) => {
    const createdAt =
      pickRecordTimestamp(s) ||
      pickRecordTimestamp({ createdAt: s.updatedAt ?? s.updated_at });
    return {
      id: s.id,
      name: s.name ?? '',
      start_time: s.start_time ?? s.startTime ?? '',
      end_time: s.end_time ?? s.endTime ?? '',
      break_minutes: s.break_minutes ?? s.breakMinutes ?? 0,
      locationId: s.locationId || s.location_id || s.location?.id || defaultLocationId || '',
      createdAt,
    };
  });
}

export function parseTimeToMinutes(t) {
  if (!t || typeof t !== 'string') return null;
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function grossShiftSpanMinutes(start, end) {
  const a = parseTimeToMinutes(start);
  const b = parseTimeToMinutes(end);
  if (a == null || b == null) return null;
  let span = b - a;
  if (span <= 0) span += 24 * 60;
  return span;
}

export function netWorkingMinutes(start, end, breakMinutes) {
  const gross = grossShiftSpanMinutes(start, end);
  if (gross == null) return null;
  const br = Number(breakMinutes);
  const b = Number.isFinite(br) ? Math.max(0, br) : 0;
  const net = gross - b;
  return net >= 0 ? net : null;
}

export function formatDurationHuman(totalMinutes) {
  if (totalMinutes == null || !Number.isFinite(totalMinutes)) return null;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function locationLabelForId(branchLocations, id) {
  if (!id) return null;
  const loc = branchLocations.find((l) => l.id === id);
  if (!loc) return null;
  return loc.city ? `${loc.name}, ${loc.city}` : loc.name;
}

export function shiftRowStatus(row) {
  const hasLoc = row?.locationId && String(row.locationId).trim() !== '';
  const hasName = row?.name && String(row.name).trim() !== '';
  const hasTimes =
    parseTimeToMinutes(row?.start_time) != null && parseTimeToMinutes(row?.end_time) != null;
  if (hasName && hasTimes && hasLoc) return 'ready';
  return 'incomplete';
}

export function shiftScheduleDescription(row) {
  const tooltip = shiftTimeRangeTooltip(row?.start_time, row?.end_time);
  const net = formatDurationHuman(
    netWorkingMinutes(row?.start_time, row?.end_time, row?.break_minutes),
  );
  if (!tooltip) return '—';
  return net ? `${tooltip} · ${net} net` : tooltip;
}

export function serializeShiftForApi(shift) {
  const base = {
    name: shift.name.trim(),
    start_time: shift.start_time,
    end_time: shift.end_time,
    break_minutes: Number(shift.break_minutes) || 0,
    locationId: String(shift.locationId).trim(),
  };
  const sid = typeof shift.id === 'string' ? shift.id.trim() : '';
  if (
    sid &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sid)
  ) {
    return { ...base, id: sid };
  }
  return base;
}

export function generateShiftId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `shift-${Date.now()}`;
}
