const SUBSCRIPTION_ERROR_MARKERS = [
  'organization plan has expired',
  'no active subscription plan',
  'renew the plan',
];

export function isSubscriptionLoginError(message) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return SUBSCRIPTION_ERROR_MARKERS.some((marker) => normalized.includes(marker));
}
