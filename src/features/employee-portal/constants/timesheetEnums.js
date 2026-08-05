export const TIMESHEET_DAY_STATUS = {
  PENDING: 'PENDING',
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

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
  PENDING: 'warning',
  DRAFT: 'warning',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  MISSING: 'warning',
};

export const STATUS_LABELS = {
  PENDING: 'Pending',
  DRAFT: 'Pending',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  MISSING: 'Pending',
};

/** Normalize API/DB status to a display chip key. */
export function normalizeTimesheetStatus(status) {
  if (status == null || status === 'MISSING' || status === 'DRAFT') return 'PENDING';
  return status;
}

export const DEFAULT_INLINE_ROW = {
  workDate: '',
  categoryId: '',
  workAreaDescription: '',
  hoursSpent: 0,
  taskStatus: 'IN_PROGRESS',
  priority: 'MEDIUM',
  refNumber: '',
};

export const DEFAULT_ENTRY = DEFAULT_INLINE_ROW;
