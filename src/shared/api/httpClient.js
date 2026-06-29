import { API_BASE_URL } from '@/app/config/appConfig';

let refreshPromise = null;

function isAuthPublicPath(path) {
  if (path === '/auth/refresh' || path === '/auth/logout' || path === '/auth/session') return true;
  if (path.startsWith('/auth/handoff/')) return true;
  if (path.startsWith('/auth/login')) return true;
  if (path.startsWith('/auth/register')) return true;
  if (path.startsWith('/auth/superadmin/bootstrap')) return true;
  if (path.startsWith('/auth/employee/login')) return true;
  return false;
}

async function refreshTokensOnce() {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  }).then((res) => {
    if (!res.ok) {
      const err = new Error('Session expired');
      err.status = 401;
      throw err;
    }
  });
  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Authenticated API calls: sends HttpOnly cookies, refreshes on 401 once.
 */
export async function apiFetch(path, options = {}) {
  const { _skipAuthRetry, ...rest } = options;
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    ...(rest.headers || {}),
  };
  const isFormData =
    typeof FormData !== 'undefined' && rest.body instanceof FormData;
  if (
    rest.body !== undefined &&
    rest.body !== null &&
    !headers['Content-Type'] &&
    !isFormData
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const init = {
    credentials: 'include',
    ...rest,
    headers,
  };

  let res = await fetch(url, init);

  if (res.status === 401 && !_skipAuthRetry && !isAuthPublicPath(path)) {
    await refreshTokensOnce();
    res = await fetch(url, init);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    let message = 'Request failed. Please try again.';
    if (payload?.message) {
      message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : String(payload.message);
    } else if (payload?.error) {
      message = String(payload.error);
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return payload;
}
