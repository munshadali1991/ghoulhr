import { API_BASE_URL } from '../config/appConfig';

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

export function getOrgAdminDashboardStats(accessToken) {
  return apiRequest('/org-admin/dashboard/stats', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getOrganizationEmployees(accessToken, organizationId) {
  return apiRequest(`/org-admin/employees?organizationId=${organizationId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getOrganizationAttendance(accessToken, organizationId, date) {
  return apiRequest(
    `/org-admin/attendance?organizationId=${organizationId}&date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export function getOrganizationPayroll(accessToken, organizationId, month) {
  return apiRequest(
    `/org-admin/payroll?organizationId=${organizationId}&month=${month}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export function getOrganizationDetails(accessToken, organizationId) {
  return apiRequest(`/org-admin/organization/${organizationId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
