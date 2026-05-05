/** @typedef {{ value: string; label: string }} Option */

/** @type {Option[]} */
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT', label: 'Prefer not to say' },
];

/** @type {Option[]} */
export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'CONSULTANT', label: 'Consultant' },
];

/** @type {Option[]} */
export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PROBATION', label: 'Probation' },
  { value: 'NOTICE_PERIOD', label: 'Notice period' },
];

/** @type {Option[]} */
export const WORK_MODE_OPTIONS = [
  { value: 'WFO', label: 'Work from office' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
];

/** @type {Option[]} */
export const TAX_REGIME_OPTIONS = [
  { value: 'OLD', label: 'Old regime' },
  { value: 'NEW', label: 'New regime' },
];

/** @type {Option[]} */
export const BANK_VERIFICATION_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

/** @type {Option[]} */
export const PORTAL_ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'HR', label: 'HR' },
  { value: 'PAYROLL', label: 'Payroll' },
  { value: 'ADMIN', label: 'Admin' },
];

/** Master-data placeholders until admin APIs exist */
export const DEPARTMENT_SUGGESTIONS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Operations',
  'Sales',
  'Marketing',
  'Legal',
  'IT',
];

export const DESIGNATION_SUGGESTIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Engineering Manager',
  'HR Business Partner',
  'Payroll Specialist',
  'People Operations',
];

/** @type {Option[]} */
export const EMERGENCY_RELATIONSHIP_OPTIONS = [
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'CHILD', label: 'Child' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'OTHER_RELATIVE', label: 'Other relative' },
  { value: 'OTHER', label: 'Other' },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'OFFER_LETTER', label: 'Offer letter' },
  { value: 'APPOINTMENT_LETTER', label: 'Appointment letter' },
  { value: 'RESUME', label: 'Resume' },
  { value: 'PAN_CARD', label: 'PAN card' },
  { value: 'AADHAAR_CARD', label: 'Aadhaar card' },
  { value: 'PASSPORT_PHOTO', label: 'Passport photo' },
  { value: 'CANCELLED_CHEQUE', label: 'Cancelled cheque' },
];

/** @param {string} value */
export function documentTypeLabel(value) {
  const o = DOCUMENT_TYPE_OPTIONS.find((x) => x.value === value);
  return o?.label ?? value ?? '';
}

export const STEP_LABELS = [
  'Basic info',
  'Employment',
  'Payroll & bank',
  'Compliance',
  'Emergency contact',
  'Documents',
  'System access',
];

export const DRAFT_STORAGE_PREFIX = 'ghoulhr_hr_onboarding_draft';
