import { apiFetch } from '@/shared/api/httpClient';
import { getCurrentPosition } from '../utils/getCurrentPosition';
import {
  getMockEmployeeSwipes,
  getMockLeaveCalendar,
  getMockLeaveTransactions,
  getMockTeamOnLeave,
  getMockTeamOnLeaveChart,
  getMockWhoIsIn,
  isEssQaMocksEnabled,
} from '../mocks/essQaMocks';

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
  if (isEssQaMocksEnabled()) {
    return getMockLeaveCalendar(year, month, filter);
  }
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
  if (isEssQaMocksEnabled()) {
    return getMockLeaveTransactions(date, filter, search);
  }
  const qs = new URLSearchParams({ date, filter });
  if (search) qs.set('search', search);
  return apiFetch(`/ess/leave/transactions?${qs.toString()}`);
}

/**
 * Direct reports with APPROVED leave today / this month (managers).
 * @returns {Promise<{
 *   hasTeam: boolean,
 *   today: Array<{ employeeId: string, name: string, employeeCode: string, initials: string }>,
 *   thisMonth: Array<{
 *     employeeId: string,
 *     name: string,
 *     employeeCode: string,
 *     initials: string,
 *     days: number,
 *     dates: string[],
 *   }>,
 * }>}
 */
export async function fetchTeamOnLeave() {
  if (isEssQaMocksEnabled()) {
    return getMockTeamOnLeave();
  }
  return apiFetch('/ess/leave/team-on-leave');
}

/**
 * @param {{ from: string, to: string, type?: string }} params
 */
export async function fetchTeamOnLeaveChart(params) {
  if (isEssQaMocksEnabled()) {
    return getMockTeamOnLeaveChart(params);
  }
  const qs = new URLSearchParams();
  qs.set('from', params.from);
  qs.set('to', params.to);
  if (params.type) qs.set('type', params.type);
  return apiFetch(`/ess/leave/team-on-leave/chart?${qs.toString()}`);
}

/**
 * @param {{ from: string, to: string, type?: string }} params
 */
export async function downloadTeamOnLeaveChartCsv(params) {
  const qs = new URLSearchParams();
  qs.set('from', params.from);
  qs.set('to', params.to);
  if (params.type) qs.set('type', params.type);

  const { getApiBaseUrl } = await import('@/app/config/appConfig');
  const url = `${getApiBaseUrl()}/ess/leave/team-on-leave/chart/export?${qs.toString()}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    let message = 'Export failed';
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      /* ignore */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `team-on-leave-${params.from}-to-${params.to}.csv`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
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

/**
 * Who is in roster for a work date (scoped by RBAC).
 * @param {string} [date] YYYY-MM-DD
 */
export async function fetchWhoIsIn(date) {
  if (isEssQaMocksEnabled()) {
    return getMockWhoIsIn(date);
  }
  const qs = new URLSearchParams();
  if (date) qs.set('date', date);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch(`/ess/attendance/who-is-in${suffix}`);
}

/**
 * @param {{ from: string, to: string, q?: string, punchType?: string, page?: number, pageSize?: number }} params
 */
export async function fetchEmployeeSwipes(params) {
  if (isEssQaMocksEnabled()) {
    return getMockEmployeeSwipes(params);
  }
  const qs = new URLSearchParams();
  qs.set('from', params.from);
  qs.set('to', params.to);
  if (params.q) qs.set('q', params.q);
  if (params.punchType) qs.set('punchType', params.punchType);
  if (params.page != null) qs.set('page', String(params.page));
  if (params.pageSize != null) qs.set('pageSize', String(params.pageSize));
  return apiFetch(`/ess/attendance/swipes?${qs.toString()}`);
}

/**
 * Download CSV for the same filters as the swipes list.
 * @param {{ from: string, to: string, q?: string, punchType?: string }} params
 */
export async function downloadEmployeeSwipesCsv(params) {
  const qs = new URLSearchParams();
  qs.set('from', params.from);
  qs.set('to', params.to);
  if (params.q) qs.set('q', params.q);
  if (params.punchType) qs.set('punchType', params.punchType);

  const { getApiBaseUrl } = await import('@/app/config/appConfig');
  const url = `${getApiBaseUrl()}/ess/attendance/swipes/export?${qs.toString()}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    let message = 'Export failed';
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      /* ignore */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `employee-swipes-${params.from}-to-${params.to}.csv`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function fetchEmployeeHome() {
  return apiFetch('/ess/home');
}

export async function signInAttendance(signInLocation) {
  const coords = await getCurrentPosition();
  return apiFetch('/ess/attendance/sign-in', {
    method: 'POST',
    body: JSON.stringify({ ...coords, signInLocation }),
  });
}

export async function signOutAttendance() {
  const coords = await getCurrentPosition();
  return apiFetch('/ess/attendance/sign-out', {
    method: 'POST',
    body: JSON.stringify(coords),
  });
}

/**
 * @param {string} [status]
 */
export async function fetchAttendanceRegularization(status) {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch(`/ess/attendance/regularization${suffix}`);
}

/**
 * @param {{ workDate: string, inTime: string, outTime: string, reason: string }} payload
 */
export async function submitAttendanceRegularization(payload) {
  return apiFetch('/ess/attendance/regularization', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * @param {string} id
 */
export async function withdrawAttendanceRegularization(id) {
  return apiFetch(`/ess/attendance/regularization/${encodeURIComponent(id)}/withdraw`, {
    method: 'POST',
  });
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
