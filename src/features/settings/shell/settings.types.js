/**
 * @typedef {Object} Setting
 * @property {string} key - Setting key (e.g., "org.name")
 * @property {any} value - Setting value
 * @property {string} id - Setting ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} SettingsFormData
 * @property {string} [name] - Organization name
 * @property {string} [logo] - Organization logo URL
 * @property {string} [timezone] - Timezone (e.g., "Asia/Kolkata")
 * @property {string} [currency] - Currency code (e.g., "INR", "USD")
 * @property {string} [dateFormat] - Date format (e.g., "DD/MM/YYYY")
 * @property {string} [language] - Language code (e.g., "en", "hi")
 * @property {string} [financialYearStartMonth] - FY start month 1–12
 */

/**
 * @typedef {Object} UseSettingsReturn
 * @property {SettingsFormData} settings - Settings data
 * @property {boolean} isLoading - Loading state
 * @property {Error|null} error - Error state
 * @property {Function} updateSettings - Update function
 * @property {boolean} isUpdating - Update loading state
 * @property {Function} refetch - Refetch function
 */
