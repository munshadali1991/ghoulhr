import { apiFetch } from '@/shared/api/httpClient';
import { downloadStoredFile } from '@/shared/api/storageApi';

export async function fetchPendingLeaveApprovals() {
  return apiFetch('/ess/approvals/leave');
}

/**
 * @param {string} id
 */
export async function fetchLeaveApprovalDetail(id) {
  return apiFetch(`/ess/approvals/leave/${encodeURIComponent(id)}`);
}

/**
 * @param {string} id
 */
export async function fetchLeaveApprovalDocument(id) {
  return apiFetch(`/ess/approvals/leave/${encodeURIComponent(id)}/document`);
}

/**
 * @param {string} id
 * @param {string} [notes]
 */
export async function approveLeaveRequest(id, notes) {
  return apiFetch(`/ess/approvals/leave/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes?.trim() || undefined }),
  });
}

/**
 * @param {string} id
 * @param {string} [reason]
 */
export async function rejectLeaveRequest(id, reason) {
  return apiFetch(`/ess/approvals/leave/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason?.trim() || undefined }),
  });
}

export async function fetchPendingTimesheetApprovals() {
  return apiFetch('/ess/approvals/timesheet');
}

/**
 * @param {string} id
 */
export async function fetchTimesheetApprovalDetail(id) {
  return apiFetch(`/ess/approvals/timesheet/${encodeURIComponent(id)}`);
}

/**
 * @param {{ from: string, to: string, status?: string, employeeId?: string }} params
 */
export async function fetchTeamTimesheetDays({ from, to, status, employeeId }) {
  const qs = new URLSearchParams({ from, to });
  if (status) qs.set('status', status);
  if (employeeId) qs.set('employeeId', employeeId);
  return apiFetch(`/ess/approvals/timesheet/team?${qs.toString()}`);
}

/**
 * @param {{ ids?: string[], from?: string, to?: string, employeeId?: string }} payload
 */
export async function bulkApproveTimesheetDays(payload) {
  return apiFetch('/ess/approvals/timesheet/bulk-approve', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * @param {string} id
 */
export async function approveTimesheetDay(id) {
  return apiFetch(`/ess/approvals/timesheet/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * @param {string} id
 * @param {string} [reason]
 */
export async function rejectTimesheetDay(id, reason) {
  return apiFetch(`/ess/approvals/timesheet/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason?.trim() || undefined }),
  });
}

/**
 * @param {{ fileName: string, mimeType: string, dataBase64?: string, downloadUrl?: string }} file
 */
export function downloadBase64File(file) {
  downloadStoredFile(file);
}
