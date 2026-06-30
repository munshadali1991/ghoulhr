import { apiFetch } from '@/shared/api/httpClient';
import { mapSettingsToForm } from '@/features/settings/shell/settingsMapper';

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

export function getOrgBranding(organizationId) {
  return settingsFetch('/settings/branding', organizationId);
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

export function getDepartments(organizationId) {
  return settingsFetch('/settings/departments', organizationId);
}

export function updateDepartments(organizationId, departments) {
  return settingsFetch('/settings/departments', organizationId, {
    method: 'POST',
    body: JSON.stringify({ departments }),
  });
}

export function getDesignations(organizationId) {
  return settingsFetch('/settings/designations', organizationId);
}

export function updateDesignations(organizationId, designations) {
  return settingsFetch('/settings/designations', organizationId, {
    method: 'POST',
    body: JSON.stringify({ designations }),
  });
}

export function getAttendanceSettings(organizationId) {
  return settingsFetch('/settings/attendance', organizationId);
}

export function getTimesheetSettings(organizationId) {
  return settingsFetch('/settings/timesheet', organizationId);
}

export function updateTimesheetSettings(organizationId, timesheetData) {
  return settingsFetch('/settings/timesheet', organizationId, {
    method: 'POST',
    body: JSON.stringify(timesheetData),
  });
}

export function updateAttendanceSettings(organizationId, attendanceData) {
  return settingsFetch('/settings/attendance', organizationId, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
}

export function getLocations(organizationId) {
  return settingsFetch('/settings/locations', organizationId);
}

export function updateLocations(organizationId, payload) {
  return settingsFetch('/settings/locations', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getLeaveConfigurations(organizationId) {
  return settingsFetch('/settings/leave-config', organizationId);
}

export function updateLeaveConfigurations(organizationId, payload) {
  return settingsFetch('/settings/leave-config', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchOrganizationCalendar(organizationId, year) {
  const qs = new URLSearchParams({ year: String(year) });
  return settingsFetch(
    `/settings/organization/calendar?${qs.toString()}`,
    organizationId,
  );
}

export function createCalendarHoliday(organizationId, body) {
  return settingsFetch('/settings/organization/calendar/holidays', organizationId, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCalendarHoliday(organizationId, id, body) {
  return settingsFetch(
    `/settings/organization/calendar/holidays/${encodeURIComponent(id)}`,
    organizationId,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function deleteCalendarHoliday(organizationId, id) {
  return settingsFetch(
    `/settings/organization/calendar/holidays/${encodeURIComponent(id)}`,
    organizationId,
    { method: 'DELETE' },
  );
}

export function publishOrganizationCalendar(organizationId, year) {
  return settingsFetch('/settings/organization/calendar/publish', organizationId, {
    method: 'POST',
    body: JSON.stringify({ year }),
  });
}
