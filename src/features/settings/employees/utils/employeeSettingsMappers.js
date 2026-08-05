import { DEFAULT_EMPLOYEE_SETTINGS_FORM, REQUIRED_FIELD_OPTIONS } from '../constants';
import {
  toApiDepartment,
  toApiDesignation,
} from '@/features/settings/org-structure/utils/orgStructure';

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
  const departments = Array.isArray(settings.departments)
    ? settings.departments.map(toApiDepartment)
    : settings.departments;
  const designations = Array.isArray(settings.designations)
    ? settings.designations.map(toApiDesignation)
    : settings.designations;

  return {
    ...formData,
    departments,
    designations,
  };
}

/**
 * @param {string} value
 */
export function requiredFieldLabel(value) {
  return REQUIRED_FIELD_OPTIONS.find((opt) => opt.value === value)?.label || value;
}
