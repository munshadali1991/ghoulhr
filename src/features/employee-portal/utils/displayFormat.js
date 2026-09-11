/**
 * Format leave/attendance day counts for display (supports half-days).
 * @param {number | string | null | undefined} days
 * @param {{ unit?: boolean }} [opts]
 * @returns {string}
 */
export function formatDaysCount(days, opts = {}) {
  const { unit = true } = opts;
  if (days == null || days === '') {
    return '—';
  }
  const n = Number(days);
  if (!Number.isFinite(n)) {
    return '—';
  }
  const label = Number.isInteger(n) ? String(n) : String(n);
  if (!unit) return label;
  if (n === 1) return '1 day';
  if (n === 0.5) return '0.5 day';
  return `${label} days`;
}

/**
 * Safe employee code label: "#E-123" or empty string when missing.
 * @param {string | null | undefined} code
 */
export function formatEmployeeCode(code) {
  const value = String(code ?? '').trim();
  return value ? `#${value}` : '';
}

/**
 * Status chip props for leave-related badges.
 * @param {string | null | undefined} status
 */
export function leaveStatusChipProps(status) {
  const normalized = String(status ?? '').toUpperCase();
  if (normalized === 'APPROVED') {
    return { label: 'Approved', color: 'success' };
  }
  if (normalized === 'PENDING') {
    return { label: 'Pending', color: 'warning' };
  }
  if (normalized === 'REJECTED') {
    return { label: 'Rejected', color: 'error' };
  }
  if (normalized === 'WITHDRAWN') {
    return { label: 'Withdrawn', color: 'default' };
  }
  return { label: status || '—', color: 'default' };
}
