/** Matches backend platform-modules.constant.ts */
export const PLATFORM_MODULES = [
  { code: 'employees', name: 'Employees' },
  { code: 'settings', name: 'Organization Settings' },
  { code: 'leave', name: 'Leave Management' },
  { code: 'attendance', name: 'Attendance' },
  { code: 'timesheet', name: 'Timesheet' },
  { code: 'payroll', name: 'Payroll' },
  { code: 'tracking', name: 'Tracking' },
  { code: 'approvals', name: 'Approvals' },
  { code: 'rbac', name: 'Roles & Permissions' },
];

export const ALL_PLATFORM_MODULE_CODES = PLATFORM_MODULES.map((m) => m.code);
