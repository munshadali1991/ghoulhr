import { API_BASE_URL, DEFAULT_BOOTSTRAP_KEY } from '../config/appConfig';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && (payload.message?.[0] ?? payload.message ?? payload.error)) ||
      'Request failed. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function loginRequest(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function bootstrapSuperAdminRequest(email, password) {
  if (!DEFAULT_BOOTSTRAP_KEY) {
    throw new Error('VITE_BOOTSTRAP_ADMIN_KEY is missing in frontend env.');
  }

  return apiRequest('/auth/superadmin/bootstrap', {
    method: 'POST',
    headers: {
      'x-bootstrap-admin-key': DEFAULT_BOOTSTRAP_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
}
