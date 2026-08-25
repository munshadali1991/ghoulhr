import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_ORG_TIMEZONE = 'Asia/Kolkata';

/**
 * @param {string | null | undefined} tz IANA timezone
 * @returns {string}
 */
export function resolveClientOrgTimezone(tz) {
  const value = String(tz ?? '').trim();
  return value || DEFAULT_ORG_TIMEZONE;
}

/**
 * Org-local "today" as YYYY-MM-DD.
 * @param {string | null | undefined} tz
 */
export function orgTodayKey(tz) {
  return dayjs().tz(resolveClientOrgTimezone(tz)).format('YYYY-MM-DD');
}

/**
 * dayjs instance in the organization timezone.
 * @param {string | null | undefined} tz
 */
export function orgNow(tz) {
  return dayjs().tz(resolveClientOrgTimezone(tz));
}
