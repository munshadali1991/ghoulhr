/** Default organization profile form values and regional option lists. */

export const DEFAULT_ORG_PROFILE_FORM = {
  name: '',
  logo: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  financialYearStartMonth: '4',
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

export const ORG_FY_START_MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

/**
 * @param {import('../types/settings.types').SettingsFormData | Record<string, unknown>} settings
 * @returns {typeof DEFAULT_ORG_PROFILE_FORM}
 */
export function orgProfileToFormValues(settings) {
  if (!settings || Object.keys(settings).length === 0) {
    return { ...DEFAULT_ORG_PROFILE_FORM };
  }

  const fyRaw = settings.financialYearStartMonth ?? DEFAULT_ORG_PROFILE_FORM.financialYearStartMonth;

  return {
    name: settings.name || '',
    logo: settings.logo || '',
    timezone: settings.timezone || DEFAULT_ORG_PROFILE_FORM.timezone,
    currency: settings.currency || DEFAULT_ORG_PROFILE_FORM.currency,
    dateFormat: settings.dateFormat || DEFAULT_ORG_PROFILE_FORM.dateFormat,
    language: settings.language || DEFAULT_ORG_PROFILE_FORM.language,
    financialYearStartMonth: String(fyRaw),
  };
}

/**
 * @param {typeof DEFAULT_ORG_PROFILE_FORM} formValues
 * @param {import('../types/settings.types').SettingsFormData | Record<string, unknown>} saved
 * @param {string | null} logoPreview
 */
export function hasOrgProfileDraftChanges(formValues, saved, logoPreview) {
  const baseline = orgProfileToFormValues(saved) ?? { ...DEFAULT_ORG_PROFILE_FORM };
  const logoChanged =
    JSON.stringify(formValues.logo ?? '') !== JSON.stringify(saved?.logo ?? baseline.logo ?? '');

  return (
    formValues.name !== baseline.name ||
    formValues.timezone !== baseline.timezone ||
    formValues.currency !== baseline.currency ||
    formValues.dateFormat !== baseline.dateFormat ||
    formValues.language !== baseline.language ||
    formValues.financialYearStartMonth !== baseline.financialYearStartMonth ||
    logoChanged ||
    Boolean(logoPreview && typeof saved?.logo === 'string' && logoPreview !== saved.logo)
  );
}

/**
 * Extract logo storage key or string for API payload.
 * @param {unknown} logo
 * @returns {string | undefined}
 */
function serializeLogoForApi(logo) {
  if (logo === undefined || logo === null || logo === '') {
    return undefined;
  }
  if (typeof logo === 'string') {
    return logo;
  }
  if (typeof logo === 'object' && logo !== null && 'storageKey' in logo) {
    const key = logo.storageKey;
    return typeof key === 'string' && key ? key : undefined;
  }
  return undefined;
}

/**
 * Convert organization profile form values to API-safe payload.
 * @param {Record<string, unknown>} formValues
 */
export function serializeOrgProfileForApi(formValues) {
  const payload = {};

  const name = typeof formValues.name === 'string' ? formValues.name.trim() : '';
  if (name) {
    payload.name = name;
  }

  const logo = serializeLogoForApi(formValues.logo);
  if (logo !== undefined) {
    payload.logo = logo;
  }

  for (const key of ['timezone', 'currency', 'dateFormat', 'language', 'financialYearStartMonth']) {
    const value = formValues[key];
    if (value !== undefined && value !== null && value !== '') {
      payload[key] = value;
    }
  }

  return payload;
}
