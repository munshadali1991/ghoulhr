import { apiFetch } from '@/shared/api/httpClient';

export async function listExpenseCategories() {
  return apiFetch('/ess/expense/categories');
}

export async function listOwnExpenseClaims(status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch(`/ess/expense/claims${qs}`);
}

export async function getOwnExpenseClaim(id) {
  return apiFetch(`/ess/expense/claims/${encodeURIComponent(id)}`);
}

export async function createExpenseClaim(payload) {
  return apiFetch('/ess/expense/claims', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateExpenseClaim(id, payload) {
  return apiFetch(`/ess/expense/claims/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function addExpenseLine(claimId, payload) {
  return apiFetch(`/ess/expense/claims/${encodeURIComponent(claimId)}/lines`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateExpenseLine(claimId, lineId, payload) {
  return apiFetch(
    `/ess/expense/claims/${encodeURIComponent(claimId)}/lines/${encodeURIComponent(lineId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
}

export async function deleteExpenseLine(claimId, lineId) {
  return apiFetch(
    `/ess/expense/claims/${encodeURIComponent(claimId)}/lines/${encodeURIComponent(lineId)}`,
    { method: 'DELETE' },
  );
}

export async function submitExpenseClaim(id) {
  return apiFetch(`/ess/expense/claims/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function withdrawExpenseClaim(id) {
  return apiFetch(`/ess/expense/claims/${encodeURIComponent(id)}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getOwnExpenseReceipt(claimId, lineId) {
  const result = await apiFetch(
    `/ess/expense/claims/${encodeURIComponent(claimId)}/lines/${encodeURIComponent(lineId)}/receipt`,
  );
  return normalizeExpenseReceiptDownload(result);
}

/**
 * Normalize storage download payload for downloadStoredFile / preview.
 * @param {{ mode?: string, url?: string, fileName?: string, mimeType?: string, dataBase64?: string }} result
 * @param {{ asPreview?: boolean }} [options]
 */
export function normalizeExpenseReceiptDownload(result, { asPreview = false } = {}) {
  if (!result) return result;
  if (result.mode === 'signedUrl' && result.url) {
    if (asPreview) {
      return {
        previewUrl: result.url,
        fileName: result.fileName,
        mimeType: result.mimeType,
      };
    }
    return {
      downloadUrl: result.url,
      fileName: result.fileName,
      mimeType: result.mimeType,
    };
  }
  if (result.mode === 'inline' && result.dataBase64) {
    return {
      dataBase64: result.dataBase64,
      fileName: result.fileName,
      mimeType: result.mimeType,
    };
  }
  if (result.previewUrl || result.downloadUrl || result.dataBase64) {
    return result;
  }
  return result;
}

export async function getManagerExpenseReceipt(claimId, lineId) {
  const result = await apiFetch(
    `/ess/approvals/expense/${encodeURIComponent(claimId)}/lines/${encodeURIComponent(lineId)}/receipt`,
  );
  return normalizeExpenseReceiptDownload(result);
}

export async function getManagerExpenseReceiptPreview(claimId, lineId) {
  const result = await apiFetch(
    `/ess/approvals/expense/${encodeURIComponent(claimId)}/lines/${encodeURIComponent(lineId)}/receipt/preview`,
  );
  return normalizeExpenseReceiptDownload(result, { asPreview: true });
}

export async function listPendingExpenseApprovals() {
  return apiFetch('/ess/approvals/expense');
}

export async function getExpenseApprovalDetail(id) {
  return apiFetch(`/ess/approvals/expense/${encodeURIComponent(id)}`);
}

export async function approveExpenseAsManager(id, notes) {
  return apiFetch(`/ess/approvals/expense/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function rejectExpenseAsManager(id, reason) {
  return apiFetch(`/ess/approvals/expense/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function sendBackExpenseAsManager(id, reason) {
  return apiFetch(`/ess/approvals/expense/${encodeURIComponent(id)}/send-back`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function listFinancePendingClaims() {
  return apiFetch('/ess/expense/finance/pending');
}

export async function listPayableClaims() {
  return apiFetch('/ess/expense/finance/payable');
}

export async function getFinanceClaimDetail(id) {
  return apiFetch(`/ess/expense/finance/${encodeURIComponent(id)}`);
}

export async function approveExpenseAsFinance(id, notes) {
  return apiFetch(`/ess/expense/finance/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function rejectExpenseAsFinance(id, reason) {
  return apiFetch(`/ess/expense/finance/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function sendBackExpenseAsFinance(id, reason) {
  return apiFetch(`/ess/expense/finance/${encodeURIComponent(id)}/send-back`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function markExpensePaid(id, payload) {
  return apiFetch(`/ess/expense/finance/${encodeURIComponent(id)}/mark-paid`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function exportExpenseCsv(status = 'BOTH') {
  const data = await apiFetch(
    `/ess/expense/finance/export?status=${encodeURIComponent(status)}`,
  );
  return data.csv;
}

export async function listAdminExpenseCategories() {
  return apiFetch('/settings/expense/categories');
}

export async function saveAdminExpenseCategories(categories) {
  return apiFetch('/settings/expense/categories', {
    method: 'POST',
    body: JSON.stringify({ categories }),
  });
}

export async function getExpensePolicy() {
  return apiFetch('/settings/expense/policy');
}

export async function saveExpensePolicy(payload) {
  return apiFetch('/settings/expense/policy', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
