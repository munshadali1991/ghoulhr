/**
 * KPI competency ratings (Q10-36 dropdown), highest to lowest.
 */
export const RATING_OPTIONS = [
  'OUTSTANDING',
  'EXCELLENT',
  'GOOD',
  'AVERAGE',
  'NEEDS IMPROVEMENT',
];

/**
 * Numeric weight per rating, mirrored on the backend
 * (ess/performance/performance.constants.ts) for authoritative scoring.
 */
export const RATING_WEIGHTS = {
  OUTSTANDING: 5,
  EXCELLENT: 4,
  GOOD: 3,
  AVERAGE: 2,
  'NEEDS IMPROVEMENT': 1,
};

export const MAX_RATING_WEIGHT = 5;

/** Manager overall rating scale (Q43). */
export const MANAGER_OVERALL_OPTIONS = ['A+', 'A', 'B+', 'B', 'C'];

export const ASSESSMENT_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  MANAGER_REVIEWED: 'MANAGER_REVIEWED',
  COMPLETED: 'COMPLETED',
};

export const ASSESSMENT_STATUS_META = {
  DRAFT: { label: 'Draft', color: 'default' },
  SUBMITTED: { label: 'Submitted', color: 'secondary' },
  MANAGER_REVIEWED: { label: 'Manager Reviewed', color: 'warning' },
  COMPLETED: { label: 'Completed', color: 'success' },
};

export const ANSWER_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  HR: 'HR',
  HR_ADMIN: 'HR_ADMIN',
};

export const MANAGER_CLASS_ROLES = ['MANAGER', 'TEAM_LEAD'];
export const HR_CLASS_ROLES = ['HR_ADMIN', 'ORG_ADMIN'];

/** Question render types used by the question engine. */
export const QUESTION_TYPES = {
  NARRATIVE: 'narrative',
  TEXTAREA: 'textarea',
  RADIO: 'radio',
  RATING: 'rating',
  NUMBER: 'number',
  TEXT: 'text',
  SELECT: 'select',
};

/** Map legacy section role codes to RBAC role codes. */
export function normalizeSectionRoleCode(code) {
  if (code === 'HR') return 'HR_ADMIN';
  return code ?? '';
}

export function isManagerClassRole(code) {
  return MANAGER_CLASS_ROLES.includes(normalizeSectionRoleCode(code));
}

export function isHrClassRole(code) {
  return HR_CLASS_ROLES.includes(normalizeSectionRoleCode(code));
}
