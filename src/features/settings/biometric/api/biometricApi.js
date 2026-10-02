import { apiFetch } from '@/shared/api/httpClient';

function settingsFetch(path, organizationId, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: {
      'x-org-id': organizationId,
      ...(options.headers ?? {}),
    },
  });
}

export function listBiometricDevices(organizationId) {
  return settingsFetch('/settings/biometric/devices', organizationId);
}

export function createBiometricDevice(organizationId, payload) {
  return settingsFetch('/settings/biometric/devices', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateBiometricDevice(organizationId, id, payload) {
  return settingsFetch(`/settings/biometric/devices/${id}`, organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteBiometricDevice(organizationId, id, reason) {
  return settingsFetch(`/settings/biometric/devices/${id}`, organizationId, {
    method: 'DELETE',
    body: JSON.stringify({ reason }),
  });
}

export function listBiometricMappings(organizationId, q) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return settingsFetch(`/settings/biometric/mappings${qs}`, organizationId);
}

export function getNextBiometricId(organizationId) {
  return settingsFetch('/settings/biometric/mappings/next-id', organizationId);
}

export function assignBiometricId(organizationId, employeeId, payload) {
  return settingsFetch(`/settings/biometric/mappings/${employeeId}`, organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function clearBiometricId(organizationId, employeeId, reason) {
  return settingsFetch(`/settings/biometric/mappings/${employeeId}`, organizationId, {
    method: 'DELETE',
    body: JSON.stringify({ reason }),
  });
}

export function listUnmappedPunches(organizationId, status = 'OPEN') {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return settingsFetch(`/settings/biometric/unmapped${qs}`, organizationId);
}

export function resolveUnmappedPunch(organizationId, id, payload) {
  return settingsFetch(`/settings/biometric/unmapped/${id}/resolve`, organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchLiveAttendance(params = {}) {
  const qs = new URLSearchParams();
  if (params.since) qs.set('since', params.since);
  if (params.limit != null) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch(`/ess/attendance/live${suffix}`);
}
