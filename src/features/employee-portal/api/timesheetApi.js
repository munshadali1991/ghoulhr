import { apiFetch } from '@/shared/api/httpClient';

/**
 * @param {string} date YYYY-MM-DD
 */
export async function fetchTimesheetDay(date) {
  return apiFetch(`/ess/timesheet/days/${encodeURIComponent(date)}`);
}

/**
 * @param {string} date
 * @param {{ status: string, entries: object[] }} payload
 */
export async function upsertTimesheetDay(date, payload) {
  return apiFetch(`/ess/timesheet/days/${encodeURIComponent(date)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Reopen a submitted timesheet so entries can be edited (status → DRAFT).
 * @param {string} date YYYY-MM-DD
 */
export async function reopenTimesheetDay(date) {
  return apiFetch(`/ess/timesheet/days/${encodeURIComponent(date)}/reopen`, {
    method: 'POST',
  });
}

/**
 * @param {{ granularity: string, from: string, to: string }} params
 */
export async function fetchTimesheetReports(params) {
  const qs = new URLSearchParams({
    granularity: params.granularity,
    from: params.from,
    to: params.to,
  });
  return apiFetch(`/ess/timesheet/reports?${qs.toString()}`);
}

export async function fetchTimesheetSettings() {
  return apiFetch('/ess/timesheet/settings');
}
