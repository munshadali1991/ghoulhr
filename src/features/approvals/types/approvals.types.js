/**
 * @typedef {import('@/features/employee-portal/types/employeePortal.types').LeaveRequest} LeaveRequest
 */

/**
 * @typedef {LeaveRequest & {
 *   employeeId: string,
 *   employeeName: string,
 *   employeeCode?: string,
 *   departmentName?: string,
 *   designationName?: string,
 *   contactDetails?: string,
 *   rejectionReason?: string,
 *   approvalNotes?: string,
 *   hasDocument?: boolean,
 *   supportingDocument?: { id: string, fileName: string, mimeType: string, sizeBytes: number } | null,
 * }} LeaveApprovalRequest
 */

/**
 * @typedef {{
 *   request: LeaveApprovalRequest,
 *   employee: { id: string, name: string, employeeCode?: string, departmentName?: string, designationName?: string },
 *   balanceSnapshot: { leaveConfigurationId: string, leaveType: string, year: number, granted: number, consumed: number, pending: number, available: number } | null,
 *   allBalances: Array<{ leaveType: string, granted: number, consumed: number, pending: number, available: number }>,
 *   history: Array<{ id: string, leaveType: string, status: string, daysCount: number, duration: object, appliedOn: string }>,
 *   teamCoverage: Array<{ employeeId: string, employeeName: string, leaveType: string, status: string, startDate: string, endDate: string, daysCount: number }>,
 *   supportingDocument: { id: string, fileName: string, mimeType: string, sizeBytes: number } | null,
 *   workflow: { currentStep: string, assignedApproverName: string, configuredSteps: string[] },
 * }} LeaveApprovalDetail
 */

/**
 * @typedef {{
 *   id: string,
 *   workDate: string,
 *   status: string,
 *   totalHours: number,
 *   employeeId: string,
 *   employeeName: string,
 *   employeeCode?: string,
 *   submittedAt: string | null,
 * }} TimesheetApprovalRequest
 */

/**
 * @typedef {{
 *   employee: { id: string, name: string, employeeCode?: string, departmentName?: string, designationName?: string },
 *   day: {
 *     id: string,
 *     workDate: string,
 *     status: string,
 *     totalHours: number,
 *     submittedAt: string | null,
 *     approvedAt: string | null,
 *     rejectedAt: string | null,
 *     rejectionReason: string | null,
 *     approverName: string | null,
 *     entries: object[],
 *   },
 *   canAct: boolean,
 * }} TimesheetApprovalDetail
 */

export {};
