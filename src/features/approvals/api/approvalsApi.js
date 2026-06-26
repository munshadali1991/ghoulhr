import { apiFetch } from '@/shared/api/httpClient';

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

/**
 * @param {{ fileName: string, mimeType: string, dataBase64: string }} file
 */
export function downloadBase64File(file) {
  const link = document.createElement('a');
  link.href = `data:${file.mimeType};base64,${file.dataBase64}`;
  link.download = file.fileName;
  link.click();
}
