import { getApiBaseUrl, DEFAULT_BOOTSTRAP_KEY } from '@/app/config/appConfig';
import { SESSION_EXPIRED_EVENT } from '@/features/auth/hooks/useSessionExpiry';

async function parseJsonResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return payload;
}

async function authPost(path, body, extraHeaders = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    let message = 'Request failed. Please try again.';
    if (payload?.message) {
      message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : String(payload.message);
    } else if (payload?.error) {
      message = String(payload.error);
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function loadSessionFromApi(options = {}) {
  const { suppressSessionExpiredEvent = false } = options;

  let res = await fetch(`${getApiBaseUrl()}/auth/session`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    const r2 = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!r2.ok) {
      if (!suppressSessionExpiredEvent && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
      return null;
    }
    res = await fetch(`${getApiBaseUrl()}/auth/session`, {
      credentials: 'include',
    });
  }

  if (!res.ok) {
    return null;
  }

  const data = await parseJsonResponse(res);
  if (!data?.user) {
    return null;
  }

  return {
    user: data.user,
    entitledModules: data.entitledModules ?? [],
    permissions: data.permissions ?? [],
    roles: data.roles ?? [],
    sessionExpiresAt: data.sessionExpiresAt ?? null,
  };
}

/**
 * @param {{ suppressSessionExpiredEvent?: boolean }} [options]
 */
export async function fetchSession(options) {
  return loadSessionFromApi(options);
}

export async function fetchSessionUser() {
  const session = await loadSessionFromApi();
  return session?.user ?? null;
}

export async function logoutRequest() {
  await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export function loginRequest(email, password) {
  return authPost('/auth/login', { email, password });
}

export function bootstrapSuperAdminRequest(email, password) {
  if (!DEFAULT_BOOTSTRAP_KEY) {
    throw new Error('VITE_BOOTSTRAP_ADMIN_KEY is missing in frontend env.');
  }

  return authPost(
    '/auth/superadmin/bootstrap',
    { email, password },
    {
      'x-bootstrap-admin-key': DEFAULT_BOOTSTRAP_KEY,
    },
  );
}

/** @deprecated Use loginRequest — unified tenant login. */
export function employeeLoginRequest(email, password, subdomain) {
  const body = { email, password };
  if (subdomain) {
    body.subdomain = subdomain;
  }
  return authPost('/auth/login', body);
}

export function changePasswordRequest(currentPassword, newPassword) {
  return authPost('/auth/change-password', { currentPassword, newPassword });
}

export function consumeHandoffRequest(code) {
  return authPost('/auth/handoff/consume', { code });
}
