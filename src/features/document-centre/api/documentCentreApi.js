import { apiFetch } from '@/shared/api/httpClient';
import { downloadStoredFile } from '@/shared/api/storageApi';

/**
 * @param {{ category: string, subcategory?: string, employeeId?: string, financialYear?: string }} params
 */
export function listDocuments(params) {
  const qs = new URLSearchParams();
  qs.set('category', params.category);
  if (params.subcategory) qs.set('subcategory', params.subcategory);
  if (params.employeeId) qs.set('employeeId', params.employeeId);
  if (params.financialYear) qs.set('financialYear', params.financialYear);
  return apiFetch(`/document-centre/documents?${qs.toString()}`);
}

/** @param {string} id */
export async function downloadDocument(id) {
  const result = await apiFetch(
    `/document-centre/documents/${encodeURIComponent(id)}/download`,
  );
  downloadStoredFile(result);
  return result;
}

/** @param {string} id */
export function previewDocument(id) {
  return apiFetch(
    `/document-centre/documents/${encodeURIComponent(id)}/preview`,
  );
}

/** @param {string} id */
export function deleteDocument(id) {
  return apiFetch(`/document-centre/documents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/**
 * @param {{ title: string, subcategory: string, file: File }} payload
 */
export function uploadPolicy(payload) {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('title', payload.title);
  form.append('subcategory', payload.subcategory);
  return apiFetch('/document-centre/policies', { method: 'POST', body: form });
}

/**
 * @param {{ title: string, file: File }} payload
 */
export function uploadForm(payload) {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('title', payload.title);
  return apiFetch('/document-centre/forms', { method: 'POST', body: form });
}

/**
 * @param {{ file: File, financialYear: string, employeeId?: string }} payload
 */
export function uploadForm16(payload) {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('financialYear', payload.financialYear);
  if (payload.employeeId) form.append('employeeId', payload.employeeId);
  return apiFetch('/document-centre/form16/upload', {
    method: 'POST',
    body: form,
  });
}
