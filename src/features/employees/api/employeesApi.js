import { apiFetch } from '@/shared/api/httpClient';

export function listEmployees() {
  return apiFetch('/employees', {
    method: 'GET',
  });
}

export function getEmployeeById(employeeId) {
  return apiFetch(`/employees/${employeeId}`, {
    method: 'GET',
  });
}

export function createEmployee(employeeData) {
  return apiFetch('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
}

export function submitHrOnboarding(onboardingPayload) {
  return apiFetch('/employees/hr-onboarding', {
    method: 'POST',
    body: JSON.stringify(onboardingPayload),
  });
}

export function updateHrOnboarding(employeeId, onboardingPayload) {
  return apiFetch(`/employees/${employeeId}/hr-onboarding`, {
    method: 'PATCH',
    body: JSON.stringify(onboardingPayload),
  });
}

export function checkEmployeeDuplicate(body) {
  return apiFetch('/employees/check-duplicate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function resetEmployeePassword(employeeId) {
  return apiFetch(`/employees/${employeeId}/reset-password`, {
    method: 'POST',
  });
}

export function updateEmployee(employeeId, employeeData) {
  return apiFetch(`/employees/${employeeId}`, {
    method: 'PATCH',
    body: JSON.stringify(employeeData),
  });
}
