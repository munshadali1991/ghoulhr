import { API_BASE_URL } from '../config/appConfig';
import { mapSettingsToForm } from '../utils/settingsMapper';

// Helper function for authorized requests with multi-tenant support
async function authorizedSettingsRequest(path, accessToken, organizationId, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  console.log('[API] Making request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!accessToken,
    orgId: organizationId,
  });

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'x-org-id': organizationId, // Multi-tenant header
      ...(options.headers ?? {}),
    },
    ...options,
  });

  console.log('[API] Response:', {
    url,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  let payload = null;
  try {
    payload = await response.json();
    console.log('[API] Response payload:', payload);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && (payload.message?.[0] ?? payload.message ?? payload.error)) ||
      'Settings request failed. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

// Get all settings for the organization
export function getAllSettings(accessToken, organizationId) {
  return authorizedSettingsRequest('/settings', accessToken, organizationId);
}

// Get a specific setting by key
export function getSettingByKey(accessToken, organizationId, key) {
  return authorizedSettingsRequest(`/settings/${key}`, accessToken, organizationId);
}

// Create or update a setting
export function updateSetting(accessToken, organizationId, payload) {
  return authorizedSettingsRequest('/settings', accessToken, organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Update organization profile (batch update)
export function updateOrgProfile(accessToken, organizationId, profileData) {
  return authorizedSettingsRequest('/settings/profile', accessToken, organizationId, {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

// Get organization profile
export function getOrgProfile(accessToken, organizationId) {
  return authorizedSettingsRequest('/settings/profile', accessToken, organizationId).then(
    (response) => {
      // If response is an array, map it to form object
      if (Array.isArray(response)) {
        return mapSettingsToForm(response);
      }
      // If it's already an object, return as-is
      return response;
    }
  );
}

// Get employee settings
export function getEmployeeSettings(accessToken, organizationId) {
  return authorizedSettingsRequest('/settings/employee', accessToken, organizationId);
}

// Update employee settings
export function updateEmployeeSettings(accessToken, organizationId, employeeData) {
  return authorizedSettingsRequest('/settings/employee', accessToken, organizationId, {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
}

// Get attendance settings
export function getAttendanceSettings(accessToken, organizationId) {
  console.log('[API] getAttendanceSettings called:', { 
    url: `${API_BASE_URL}/settings/attendance`,
    hasToken: !!accessToken, 
    orgId: organizationId 
  });
  return authorizedSettingsRequest('/settings/attendance', accessToken, organizationId);
}

// Update attendance settings
export function updateAttendanceSettings(accessToken, organizationId, attendanceData) {
  return authorizedSettingsRequest('/settings/attendance', accessToken, organizationId, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
}
