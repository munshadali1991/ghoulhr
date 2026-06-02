import { shiftTimeRangeTooltip } from '@/shared/utils/shiftTime';

/**
 * Resolve stored business unit (location id or legacy name) to a location id.
 * @param {string} value
 * @param {Array<{ id?: string, name?: string }>} locations
 */
export function resolveBusinessUnitToLocationId(value, locations) {
  const v = String(value || '').trim();
  if (!v) return '';

  const list = Array.isArray(locations) ? locations : [];
  const byId = list.find((l) => String(l.id) === v);
  if (byId) return String(byId.id);

  const lower = v.toLowerCase();
  const byName = list.find((l) => String(l.name || '').trim().toLowerCase() === lower);
  return byName ? String(byName.id) : '';
}

/**
 * @param {string} locationId
 * @param {Array<{ id?: string, name?: string }>} locations
 */
export function locationNameForId(locationId, locations) {
  if (!locationId) return '';
  const loc = (Array.isArray(locations) ? locations : []).find((l) => String(l.id) === String(locationId));
  return loc?.name ? String(loc.name).trim() : '';
}

/**
 * @param {Array<{ locationId?: string, name?: string }>} shifts
 * @param {string} locationId
 */
export function getShiftsForLocation(shifts, locationId) {
  if (!locationId) return [];
  const id = String(locationId);
  return (Array.isArray(shifts) ? shifts : []).filter(
    (s) => String(s.locationId) === id && String(s.name || '').trim(),
  );
}

/**
 * @param {{ name?: string, start_time?: string, end_time?: string }} shift
 */
export function formatShiftOptionLabel(shift) {
  const name = String(shift?.name || '').trim();
  if (!name) return '';
  const range = shiftTimeRangeTooltip(shift.start_time, shift.end_time);
  return range ? `${name} (${range})` : name;
}

/**
 * Match stored shift text to a configured shift for the location.
 * @param {string} shiftValue
 * @param {Array<{ name?: string }>} locationShifts
 */
export function resolveShiftName(shiftValue, locationShifts) {
  const v = String(shiftValue || '').trim();
  if (!v) return '';

  const list = Array.isArray(locationShifts) ? locationShifts : [];
  const exact = list.find((s) => String(s.name).trim() === v);
  if (exact) return String(exact.name).trim();

  const lower = v.toLowerCase();
  const byName = list.find((s) => String(s.name || '').trim().toLowerCase() === lower);
  return byName ? String(byName.name).trim() : v;
}
