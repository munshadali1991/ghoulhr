export const TIMESHEET_DAY_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const WORK_TYPES = [
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'BUG_FIX', label: 'Bug Fix' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
  { value: 'DEPLOYMENT', label: 'Deployment' },
  { value: 'SUPPORT', label: 'Support' },
];

export const TASK_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

export const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const STATUS_CHIP_COLOR = {
  DRAFT: 'warning',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  MISSING: 'default',
};

export const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  MISSING: 'Missing',
};

export const DEFAULT_ENTRY = {
  projectName: '',
  taskName: '',
  taskDescription: '',
  workType: 'DEVELOPMENT',
  hoursSpent: 1,
  taskStatus: 'IN_PROGRESS',
  priority: 'MEDIUM',
  blockerNotes: '',
};
