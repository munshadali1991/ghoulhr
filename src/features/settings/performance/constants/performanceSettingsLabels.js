export const ROLE_LABELS = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  TEAM_LEAD: 'Team lead',
  HR: 'HR',
  HR_ADMIN: 'HR Admin',
};

export const ROLE_CHIP_COLORS = {
  EMPLOYEE: 'primary',
  MANAGER: 'warning',
  TEAM_LEAD: 'info',
  HR: 'secondary',
  HR_ADMIN: 'secondary',
};

export const QUESTION_TYPE_LABELS = {
  narrative: 'Long text',
  textarea: 'Long text',
  text: 'Short text',
  number: 'Number',
  rating: 'Rating scale',
  select: 'Dropdown',
  radio: 'Radio buttons',
};

export function questionTypeLabel(type) {
  return QUESTION_TYPE_LABELS[type] ?? type;
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

/** Seeded default keys (q1, q10, etc.) should stay read-only in the UI. */
export function isLegacyQuestionKey(key) {
  return /^q\d+$/.test(String(key ?? '').trim());
}
