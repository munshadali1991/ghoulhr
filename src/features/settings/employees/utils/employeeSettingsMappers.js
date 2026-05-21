import { DEFAULT_EMPLOYEE_SETTINGS_FORM, REQUIRED_FIELD_OPTIONS } from '../constants';

/**
 * @param {Record<string, unknown>} settings
 * @returns {typeof DEFAULT_EMPLOYEE_SETTINGS_FORM | null}
 */
export function employeeSettingsToFormValues(settings) {
  if (!settings || Object.keys(settings).length === 0) return null;

  return {
    id_prefix: settings.id_prefix || DEFAULT_EMPLOYEE_SETTINGS_FORM.id_prefix,
    auto_generate_id:
      settings.auto_generate_id !== undefined
        ? settings.auto_generate_id
        : DEFAULT_EMPLOYEE_SETTINGS_FORM.auto_generate_id,
    required_fields: settings.required_fields || DEFAULT_EMPLOYEE_SETTINGS_FORM.required_fields,
    default_probation_period:
      settings.default_probation_period ?? DEFAULT_EMPLOYEE_SETTINGS_FORM.default_probation_period,
  };
}

/**
 * Preserves org-structure master data when saving employee tab fields only.
 * @param {Record<string, unknown>} settings
 * @param {typeof DEFAULT_EMPLOYEE_SETTINGS_FORM} formData
 */
export function buildEmployeeSettingsPayload(settings, formData) {
  return {
    ...settings,
    ...formData,
    departments: settings.departments,
    designations: settings.designations,
  };
}

/**
 * @param {string} value
 */
export function requiredFieldLabel(value) {
  return REQUIRED_FIELD_OPTIONS.find((opt) => opt.value === value)?.label || value;
}
