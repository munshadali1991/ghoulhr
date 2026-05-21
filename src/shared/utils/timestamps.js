/**
 * Normalize created timestamps from API rows (camelCase, snake_case, or nested).
 */
export function pickRecordTimestamp(record) {
  if (!record || typeof record !== 'object') return null;
  const raw =
    record.createdAt ??
    record.created_at ??
    record.created ??
    null;
  if (raw == null) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return new Date(raw).toISOString();
  if (raw instanceof Date) return raw.toISOString();
  return null;
}

export function formatDisplayDate(value) {
  const iso = typeof value === 'string' ? value : pickRecordTimestamp({ createdAt: value });
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
