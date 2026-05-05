import { apiFetch } from './httpClient';
import { mapSettingsToForm } from '../utils/settingsMapper';

function settingsFetch(path, organizationId, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: {
      'x-org-id': organizationId,
      ...(options.headers ?? {}),
    },
  });
}

export function getAllSettings(organizationId) {
  return settingsFetch('/settings', organizationId);
}

export function getSettingByKey(organizationId, key) {
  return settingsFetch(`/settings/${key}`, organizationId);
}

export function updateSetting(organizationId, payload) {
  return settingsFetch('/settings', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateOrgProfile(organizationId, profileData) {
  return settingsFetch('/settings/profile', organizationId, {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

export function getOrgProfile(organizationId) {
  return settingsFetch('/settings/profile', organizationId).then((response) => {
    if (Array.isArray(response)) {
      return mapSettingsToForm(response);
    }
    return response;
  });
}

export function getEmployeeSettings(organizationId) {
  return settingsFetch('/settings/employee', organizationId);
}

export function updateEmployeeSettings(organizationId, employeeData) {
  return settingsFetch('/settings/employee', organizationId, {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
}

export function getAttendanceSettings(organizationId) {
  return settingsFetch('/settings/attendance', organizationId);
}

export function updateAttendanceSettings(organizationId, attendanceData) {
  return settingsFetch('/settings/attendance', organizationId, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
}
