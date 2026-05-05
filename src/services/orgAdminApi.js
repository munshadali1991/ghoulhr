import { apiFetch } from './httpClient';

export function getOrgAdminDashboardStats() {
  return apiFetch('/org-admin/dashboard/stats');
}

export function getOrganizationEmployees(organizationId) {
  return apiFetch(`/org-admin/employees?organizationId=${organizationId}`);
}

export function getOrganizationAttendance(organizationId, date) {
  return apiFetch(`/org-admin/attendance?organizationId=${organizationId}&date=${date}`);
}

export function getOrganizationPayroll(organizationId, month) {
  return apiFetch(`/org-admin/payroll?organizationId=${organizationId}&month=${month}`);
}

export function getOrganizationDetails(organizationId) {
  return apiFetch(`/org-admin/organization/${organizationId}`);
}
