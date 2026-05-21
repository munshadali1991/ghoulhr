export const LEAVE_SUCCESS_SNACKBAR_MS = 4000;

export const ACCRUAL_TYPES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual (lump)' },
  { value: 'LUMP_SUM', label: 'At start of year' },
];

export const APPLIES_TO_OPTIONS = [
  { value: 'ALL_EMPLOYEES', label: 'Current location — all employees' },
  { value: 'ALL_BRANCHES', label: 'All locations — all employees' },
];

export const WORKFLOW_PRESETS = [
  { value: 'NONE', label: 'No approval', chain: '—' },
  { value: 'MANAGER_ONLY', label: 'Manager only', chain: 'Manager' },
  { value: 'MANAGER_HR', label: 'Manager → HR', chain: 'Manager → HR' },
  { value: 'MANAGER_HR_ADMIN', label: 'Manager → HR → Admin', chain: 'Manager → HR → Admin' },
];

export const WORKFLOW_BY_PRESET = {
  NONE: { approvalWorkflow: [], requiresApproval: false },
  MANAGER_ONLY: { approvalWorkflow: ['MANAGER'], requiresApproval: true },
  MANAGER_HR: { approvalWorkflow: ['MANAGER', 'HR'], requiresApproval: true },
  MANAGER_HR_ADMIN: { approvalWorkflow: ['MANAGER', 'HR', 'ADMIN'], requiresApproval: true },
};

export const LEAVE_WIZARD_STEPS = [
  { key: 'details', label: 'Details', description: 'Name, code, location, and description' },
  { key: 'balance', label: 'Balance', description: 'Days per year, accrual, carry-forward, and pay' },
  { key: 'rules', label: 'Rules', description: 'Half-day, documents, calendar, and visibility' },
  { key: 'approval', label: 'Approval', description: 'Who reviews requests for this leave type' },
];

export const LEAVE_WIZARD_LAST = LEAVE_WIZARD_STEPS.length - 1;
