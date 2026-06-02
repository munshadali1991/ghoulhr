import { apiFetch } from '@/shared/api/httpClient';

export async function fetchLeaveRequests(status) {
  return apiFetch(`/ess/leave/requests?status=${encodeURIComponent(status)}`);
}

export async function fetchLeaveBalances(year) {
  const data = await apiFetch(`/ess/leave/balances?year=${encodeURIComponent(year)}`);
  return { year: data.year, balances: data.balances ?? [], rules: data.rules ?? [] };
}

/**
 * @param {string} leaveConfigurationId
 * @param {number} year
 * @returns {Promise<import('../types/employeePortal.types').LeaveBalanceDetail>}
 */
export async function fetchLeaveBalanceDetail(leaveConfigurationId, year) {
  const qs = new URLSearchParams({ year: String(year) });
  return apiFetch(
    `/ess/leave/balances/${encodeURIComponent(leaveConfigurationId)}?${qs.toString()}`,
  );
}

export async function fetchLeaveTypes() {
  return apiFetch('/ess/leave/types');
}

/**
 * @param {string} [search]
 */
export async function fetchColleagues(search = '') {
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  qs.set('limit', '25');
  return apiFetch(`/ess/leave/colleagues?${qs.toString()}`);
}

/**
 * @param {object} params
 */
export async function fetchLeavePreview(params) {
  const qs = new URLSearchParams({
    leaveConfigurationId: params.leaveType,
    fromDate: params.fromDate,
    toDate: params.toDate,
    fromSession: params.fromSession,
    toSession: params.toSession,
  });
  return apiFetch(`/ess/leave/preview-days?${qs.toString()}`);
}

/**
 * @param {number} year
 * @param {number} month
 * @param {string} filter
 */
export async function fetchLeaveCalendar(year, month, filter) {
  const qs = new URLSearchParams({
    year: String(year),
    month: String(month),
    filter,
  });
  return apiFetch(`/ess/leave/calendar?${qs.toString()}`);
}

/**
 * @param {string} date
 * @param {string} filter
 * @param {string} [search]
 */
export async function fetchLeaveTransactions(date, filter, search = '') {
  const qs = new URLSearchParams({ date, filter });
  if (search) qs.set('search', search);
  return apiFetch(`/ess/leave/transactions?${qs.toString()}`);
}

export async function fetchHolidayCalendar(year) {
  return apiFetch(`/ess/holidays?year=${encodeURIComponent(year)}`);
}

/**
 * @param {object} payload
 */
export async function submitLeaveRequest(payload) {
  const body = {
    leaveConfigurationId: payload.leaveType,
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    fromSession: payload.fromSession,
    toSession: payload.toSession,
    applyingTo: payload.applyingTo,
    ccEmployeeIds: payload.ccEmployeeIds ?? [],
    notifyAllEmployees: false,
    reason: payload.reason,
    contactDetails: payload.contactDetails || undefined,
    supportingDocumentId: payload.supportingDocumentId || undefined,
    supportingDocument: payload.supportingDocument || undefined,
  };
  const data = await apiFetch('/ess/leave/requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.request;
}

export async function withdrawLeaveRequest(id) {
  return apiFetch(`/ess/leave/requests/${encodeURIComponent(id)}/withdraw`, {
    method: 'POST',
  });
}

/**
 * @param {number} year
 * @param {number} month
 */
export async function fetchAttendanceSummary(year, month) {
  const qs = new URLSearchParams({ year: String(year), month: String(month) });
  return apiFetch(`/ess/attendance/summary?${qs.toString()}`);
}

export async function fetchAttendanceDays(year, month) {
  const qs = new URLSearchParams({ year: String(year), month: String(month) });
  return apiFetch(`/ess/attendance/days?${qs.toString()}`);
}

export async function fetchAttendanceDayDetail(date) {
  return apiFetch(`/ess/attendance/days/${encodeURIComponent(date)}`);
}

export async function fetchEmployeeHome() {
  return apiFetch('/ess/home');
}

export async function signInAttendance() {
  return apiFetch('/ess/attendance/sign-in', { method: 'POST', body: JSON.stringify({}) });
}

export async function signOutAttendance() {
  return apiFetch('/ess/attendance/sign-out', { method: 'POST', body: JSON.stringify({}) });
}

export async function fetchNotifications() {
  return apiFetch('/ess/notifications');
}

export async function fetchNotificationUnreadCount() {
  return apiFetch('/ess/notifications/unread-count');
}

export async function markNotificationRead(id) {
  return apiFetch(`/ess/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead() {
  return apiFetch('/ess/notifications/read-all', { method: 'PATCH' });
}
