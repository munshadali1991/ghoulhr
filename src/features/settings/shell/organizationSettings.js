/** Default organization profile form values and regional option lists. */

export const DEFAULT_ORG_PROFILE_FORM = {
  name: '',
  logo: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
};

export const ORG_TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Singapore',
  'Australia/Sydney',
];

export const ORG_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export const ORG_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];

export const ORG_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

/**
 * @param {import('../types/settings.types').SettingsFormData | Record<string, unknown>} settings
 * @returns {typeof DEFAULT_ORG_PROFILE_FORM | null}
 */
export function orgProfileToFormValues(settings) {
  if (!settings || Object.keys(settings).length === 0) return null;

  return {
    name: settings.name || '',
    logo: settings.logo || '',
    timezone: settings.timezone || DEFAULT_ORG_PROFILE_FORM.timezone,
    currency: settings.currency || DEFAULT_ORG_PROFILE_FORM.currency,
    dateFormat: settings.dateFormat || DEFAULT_ORG_PROFILE_FORM.dateFormat,
    language: settings.language || DEFAULT_ORG_PROFILE_FORM.language,
  };
}

/**
 * @param {typeof DEFAULT_ORG_PROFILE_FORM} formValues
 * @param {import('../types/settings.types').SettingsFormData | Record<string, unknown>} saved
 * @param {string | null} logoPreview
 */
export function hasOrgProfileDraftChanges(formValues, saved, logoPreview) {
  if (!saved || Object.keys(saved).length === 0) return false;

  const baseline = orgProfileToFormValues(saved);
  if (!baseline) return false;

  return (
    formValues.name !== baseline.name ||
    formValues.timezone !== baseline.timezone ||
    formValues.currency !== baseline.currency ||
    formValues.dateFormat !== baseline.dateFormat ||
    formValues.language !== baseline.language ||
    Boolean(logoPreview && logoPreview !== (saved.logo || ''))
  );
}
