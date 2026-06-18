import { API_BASE_URL, DEFAULT_BOOTSTRAP_KEY } from '@/app/config/appConfig';

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
    const message =
      (payload && (payload.message?.[0] ?? payload.message ?? payload.error)) ||
      'Request failed. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function loadSessionFromApi() {
  let res = await fetch(`${API_BASE_URL}/auth/session`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    const r2 = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!r2.ok) {
      return null;
    }
    res = await fetch(`${API_BASE_URL}/auth/session`, {
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
  };
}

export async function fetchSession() {
  return loadSessionFromApi();
}

export async function fetchSessionUser() {
  const session = await loadSessionFromApi();
  return session?.user ?? null;
}

export async function logoutRequest() {
  await fetch(`${API_BASE_URL}/auth/logout`, {
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
