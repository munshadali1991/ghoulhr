import { apiFetch } from '@/shared/api/httpClient';

export function getEmailStatus() {
  return apiFetch('/email/status');
}

export function sendTestEmail({ to, subject, message }) {
  return apiFetch('/email/test', {
    method: 'POST',
    body: JSON.stringify({ to, subject, message }),
  });
}
