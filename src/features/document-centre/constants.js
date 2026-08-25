export const DOCUMENT_CENTRE_TABS = [
  { value: 'form16', label: 'Form 16', category: 'FORM16' },
  { value: 'policies', label: 'Company Policies', category: 'POLICY' },
  { value: 'forms', label: 'Forms', category: 'FORM' },
];

export const POLICY_SUBTABS = [
  { value: 'GENERAL', label: 'General' },
  { value: 'HR', label: 'HR' },
];

export function formatBytes(size) {
  if (!size && size !== 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPreviewableMime(mimeType, fileName = '') {
  const mime = (mimeType || '').toLowerCase();
  const name = fileName.toLowerCase();
  if (mime.startsWith('image/')) return true;
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return true;
  return false;
}
