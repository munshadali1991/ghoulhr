import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const REF = '2000-01-01';

/**
 * Parse backend / form "HH:mm" or "H:mm" into a Dayjs time (today's date, time only).
 */
export function shiftTimeToDayjs(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const t = timeStr.trim();
  let parsed = dayjs(`${REF} ${t}`, 'YYYY-MM-DD HH:mm', true);
  if (!parsed.isValid()) parsed = dayjs(`${REF} ${t}`, 'YYYY-MM-DD H:mm', true);
  if (!parsed.isValid()) return null;
  return dayjs().hour(parsed.hour()).minute(parsed.minute()).second(0).millisecond(0);
}

/** Persist as 24h "HH:mm" for API compatibility. */
export function dayjsToShiftTime(d) {
  if (!d || !d.isValid()) return '';
  return d.format('HH:mm');
}

/** Human-readable range: 24h and 12h so users always see AM/PM context. */
export function shiftTimeRangeTooltip(startStr, endStr) {
  const a = shiftTimeToDayjs(startStr);
  const b = shiftTimeToDayjs(endStr);
  if (!a || !b) return '';
  const sm = a.hour() * 60 + a.minute();
  const em = b.hour() * 60 + b.minute();
  let span = em - sm;
  if (span <= 0) span += 24 * 60;
  const spanHuman =
    span >= 60 ? `${Math.floor(span / 60)} h ${span % 60} min` : `${span} min`;
  return `${a.format('HH:mm')}–${b.format('HH:mm')} (${a.format('h:mm A')}–${b.format(
    'h:mm A',
  )}) · ${spanHuman}`;
}

/** One-line summary for collapsed shift rows. */
export function formatShiftTimesSummary(row) {
  const a = shiftTimeToDayjs(row?.start_time);
  const b = shiftTimeToDayjs(row?.end_time);
  if (!a || !b) return 'Set times';
  return `${a.format('HH:mm')}–${b.format('HH:mm')} · ${a.format('h:mm A')}–${b.format('h:mm A')}`;
}
