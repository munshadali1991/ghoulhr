const PERIOD_MONTHS = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

export function computeSubscriptionExpiresAt(subscriptionType, startsAt) {
  const months = PERIOD_MONTHS[subscriptionType] ?? 1;
  const periodEnd = startOfDay(addMonths(startOfDay(startsAt), months));
  const expiresAt = new Date(periodEnd);
  expiresAt.setDate(expiresAt.getDate() + 1);
  return expiresAt;
}

export function formatSubscriptionType(type) {
  const labels = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    HALF_YEARLY: 'Half-yearly',
    YEARLY: 'Yearly',
  };
  return labels[type] ?? type;
}

export function toDateInputValue(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function daysRemaining(expiresAtIso) {
  if (!expiresAtIso) return null;
  const ms = new Date(expiresAtIso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
