export const EMPLOYEE_SETTINGS_SUCCESS_MS = 3000;

export const DEFAULT_EMPLOYEE_SETTINGS_FORM = {
  id_prefix: 'EMP',
  auto_generate_id: true,
  required_fields: ['name', 'email'],
  default_probation_period: 90,
};

export const REQUIRED_FIELD_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'department', label: 'Department' },
  { value: 'position', label: 'Position' },
  { value: 'hire_date', label: 'Hire Date' },
  { value: 'salary', label: 'Salary' },
  { value: 'address', label: 'Address' },
  { value: 'emergency_contact', label: 'Emergency Contact' },
];

export const ID_PREFIX_PATTERN = /^[a-zA-Z0-9_-]+$/;
