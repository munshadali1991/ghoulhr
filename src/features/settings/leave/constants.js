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

export const LEAVE_TABLE_COLUMNS = [
  { key: 'index', label: '#', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'code', label: 'Code', align: 'left' },
  { key: 'location', label: 'Location', align: 'left' },
  { key: 'days', label: 'Days/yr', align: 'right' },
  { key: 'accrual', label: 'Accrual', align: 'left' },
  { key: 'paid', label: 'Paid', align: 'left' },
  { key: 'isActive', label: 'Active', align: 'center' },
  { key: 'approval', label: 'Approval', align: 'left' },
  { key: 'actions', label: 'Actions', align: 'right', nowrap: true },
];

export const LEAVE_TABLE_HEADER_CELL_SX = {
  fontWeight: 700,
  bgcolor: 'background.paper',
  zIndex: 3,
};

export const LEAVE_TABLE_CONTAINER_SX = {
  borderRadius: 2,
  maxHeight: { xs: 420, sm: 520 },
  overflow: 'auto',
};
