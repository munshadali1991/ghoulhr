import { getApiBaseUrl } from '@/app/config/appConfig';
import { SESSION_EXPIRED_EVENT } from '@/features/auth/hooks/useSessionExpiry';
import { getAppBasePath } from '@/shared/utils/tenant';
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
  refreshPromise = fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  }).then((res) => {
    if (!res.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
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
  const url = `${getApiBaseUrl()}${path}`;
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

    if (
      res.status === 403 &&
      payload?.code === 'PASSWORD_CHANGE_REQUIRED' &&
      typeof window !== 'undefined' &&
      !window.location.pathname.endsWith('/change-password')
    ) {
      window.location.assign(`${getAppBasePath()}/change-password`);
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return payload;
}
