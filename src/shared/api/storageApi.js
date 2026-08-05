import { apiFetch } from '@/shared/api/httpClient';

export const PURGE_ASSETS_CONFIRM_PHRASE = 'DELETE ALL ASSETS';

/**
 * Upload a file via backend proxy to S3.
 * @param {{
 *   file: File,
 *   category: 'employee-documents' | 'organization-files' | 'staging',
 *   module: 'onboarding' | 'leave' | 'profile-photos' | 'branding',
 *   documentType?: string,
 *   employeeId?: string,
 *   leaveRequestId?: string,
 *   uploadBatchId?: string,
 * }} params
 */
export async function uploadStorageFile(params) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('category', params.category);
  formData.append('module', params.module);
  if (params.documentType) formData.append('documentType', params.documentType);
  if (params.employeeId) formData.append('employeeId', params.employeeId);
  if (params.leaveRequestId) formData.append('leaveRequestId', params.leaveRequestId);
  if (params.uploadBatchId) formData.append('uploadBatchId', params.uploadBatchId);

  return apiFetch('/storage/upload', {
    method: 'POST',
    body: formData,
  });
}

/**
 * @param {string} documentId
 */
export async function downloadEmployeeDocument(documentId) {
  return apiFetch(`/storage/documents/${encodeURIComponent(documentId)}/download`);
}

/**
 * @param {string} storageKey
 * @param {string} [mimeType]
 */
export async function fetchStoragePreviewUrl(storageKey, mimeType) {
  const params = new URLSearchParams({ storageKey });
  if (mimeType) params.set('mimeType', mimeType);
  return apiFetch(`/storage/preview-url?${params.toString()}`);
}

/**
 * @param {{ fileName: string, mimeType: string, dataBase64?: string, downloadUrl?: string }} file
 */
export function downloadStoredFile(file) {
  if (file.downloadUrl) {
    const link = document.createElement('a');
    link.href = file.downloadUrl;
    link.download = file.fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    return;
  }
  if (file.dataBase64) {
    const link = document.createElement('a');
    link.href = `data:${file.mimeType};base64,${file.dataBase64}`;
    link.download = file.fileName;
    link.click();
  }
}

/** @returns {Promise<{ organizationId: string, prefix: string, objectCount: number }>} */
export async function fetchOrganizationAssetSummary() {
  return apiFetch('/storage/assets/summary');
}

/**
 * @param {string} confirm Must be exactly PURGE_ASSETS_CONFIRM_PHRASE
 */
export async function purgeAllOrganizationAssets(confirm) {
  return apiFetch('/storage/assets', {
    method: 'DELETE',
    body: JSON.stringify({ confirm }),
  });
}
