/**
 * Convert backend settings array to frontend form object
 * Backend: [{ key: "org.name", value: "ABC Ltd" }, { key: "org.timezone", value: "Asia/Kolkata" }]
 * Frontend: { name: "ABC Ltd", timezone: "Asia/Kolkata" }
 */
export function mapSettingsToForm(settingsArray) {
  const keyMapping = {
    'org.name': 'name',
    'org.logo': 'logo',
    'org.timezone': 'timezone',
    'org.currency': 'currency',
    'org.date_format': 'dateFormat',
    'org.language': 'language',
  };

  const formData = {};
  
  settingsArray.forEach((setting) => {
    const formKey = keyMapping[setting.key];
    if (formKey) {
      formData[formKey] = setting.value;
    }
  });

  return formData;
}

/**
 * Convert frontend form data to backend settings array
 * Frontend: { name: "ABC Ltd", timezone: "Asia/Kolkata" }
 * Backend: [{ key: "org.name", value: "ABC Ltd" }, { key: "org.timezone", value: "Asia/Kolkata" }]
 */
export function mapFormToSettings(formData) {
  const keyMapping = {
    name: 'org.name',
    logo: 'org.logo',
    timezone: 'org.timezone',
    currency: 'org.currency',
    dateFormat: 'org.date_format',
    language: 'org.language',
  };

  const settingsArray = [];

  Object.entries(formData).forEach(([formKey, value]) => {
    const backendKey = keyMapping[formKey];
    if (backendKey && value !== undefined && value !== null && value !== '') {
      settingsArray.push({
        key: backendKey,
        value: value,
      });
    }
  });

  return settingsArray;
}

/**
 * Convert form data to profile format for batch update
 * Frontend: { name: "ABC Ltd", timezone: "Asia/Kolkata" }
 * Profile: { name: "ABC Ltd", timezone: "Asia/Kolkata" }
 */
export function mapFormToProfile(formData) {
  const profileData = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      profileData[key] = value;
    }
  });

  return profileData;
}

/**
 * Convert backend employee settings to frontend form object
 * Backend: { "employee.id_prefix": "EMP", "employee.auto_generate_id": true }
 * Frontend: { id_prefix: "EMP", auto_generate_id: true }
 */
export function mapEmployeeSettingsToForm(settingsData) {
  const keyMapping = {
    'employee.id_prefix': 'id_prefix',
    'employee.auto_generate_id': 'auto_generate_id',
    'employee.required_fields': 'required_fields',
    'employee.default_probation_period': 'default_probation_period',
    'employee.departments': 'departments',
    'employee.designations': 'designations',
  };

  const formData = {};

  Object.entries(settingsData).forEach(([backendKey, value]) => {
    const formKey = keyMapping[backendKey];
    if (formKey) {
      // Parse JSON strings for complex values (arrays, objects)
      if (typeof value === 'string') {
        try {
          formData[formKey] = JSON.parse(value);
        } catch {
          formData[formKey] = value;
        }
      } else {
        formData[formKey] = value;
      }
    }
  });

  return formData;
}

/**
 * Convert frontend form data to backend employee settings format
 * Frontend: { id_prefix: "EMP", auto_generate_id: true }
 * Backend: { id_prefix: "EMP", auto_generate_id: true } (direct mapping)
 */
export function mapFormToEmployeeSettings(formData) {
  const employeeData = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Arrays and objects will be automatically serialized by JSON.stringify in the API call
      employeeData[key] = value;
    }
  });

  return employeeData;
}
