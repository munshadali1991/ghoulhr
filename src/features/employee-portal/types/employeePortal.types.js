/**
 * @typedef {'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'} LeaveRequestStatus
 */

/**
 * @typedef {'Leave' | 'Restricted Holiday' | 'Leave Cancel' | 'Comp Off Grant'} LeaveCategory
 */

/**
 * @typedef {{
 *   startDate: string,
 *   endDate: string,
 *   startSession: string,
 *   endSession: string,
 * }} LeaveDuration
 */

/**
 * @typedef {{
 *   id: string,
 *   category: LeaveCategory,
 *   leaveType: string,
 *   status: LeaveRequestStatus,
 *   daysCount: number,
 *   approverName?: string,
 *   rejectionReason?: string,
 *   approvalNotes?: string,
 *   duration: LeaveDuration,
 *   reason?: string,
 *   appliedOn: string,
 * }} LeaveRequest
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   granted: number,
 *   balance: number,
 *   consumed: number,
 *   pending?: number,
 * }} LeaveBalance
 */

/**
 * @typedef {{
 *   availableBalance: number,
 *   openingBalance: number,
 *   granted: number,
 *   availed: number,
 *   applied: number,
 * }} LeaveBalanceSummary
 */

/**
 * @typedef {{
 *   month: number,
 *   label: string,
 *   balance: number,
 *   consumed: number,
 * }} LeaveBalanceMonthlyChartPoint
 */

/**
 * @typedef {{
 *   id: string,
 *   transactionType: string,
 *   postedOn: string | null,
 *   fromDate: string,
 *   fromSession: string,
 *   toDate: string,
 *   toSession: string,
 *   days: number,
 *   reason?: string,
 *   remarks?: string | null,
 *   expiryDate?: string | null,
 * }} LeaveBalanceLedgerTransaction
 */

/**
 * @typedef {{
 *   year: number,
 *   leaveType: { id: string, name: string },
 *   summary: LeaveBalanceSummary,
 *   monthlyChart: LeaveBalanceMonthlyChartPoint[],
 *   transactions: LeaveBalanceLedgerTransaction[],
 * }} LeaveBalanceDetail
 */

/**
 * @typedef {'P' | 'A' | 'R'} AttendanceDayStatus
 */

/**
 * @typedef {'general' | 'restricted' | null} HolidayIndicator
 */

/**
 * @typedef {{
 *   date: string,
 *   status?: AttendanceDayStatus,
 *   shiftCode?: string,
 *   holiday?: HolidayIndicator,
 *   hasBreak?: boolean,
 * }} CalendarDayMarker
 */

/**
 * @typedef {{
 *   id: string,
 *   punchedAt: string,
 *   swipeTime: string,
 *   swipeDate: string,
 *   location: string,
 *   source: string,
 * }} AttendanceSwipe
 */

/**
 * @typedef {{
 *   date: string,
 *   dayOfWeek?: string,
 *   shiftName: string,
 *   shiftTime: string,
 *   scheme: string,
 *   schemeLabel?: string,
 *   firstIn: string,
 *   lastOut: string,
 *   lateIn: string,
 *   earlyOut: string,
 *   totalWorkHrs: string,
 *   breakHrs: string,
 *   actualWork: string,
 *   workHoursInShift: string,
 *   shortfallHrs: string,
 *   excessHrs: string,
 *   progressPercent: number,
 *   processedAt: string | null,
 *   locationName?: string,
 *   status: string,
 *   remarks: string,
 *   sessions: { session: string; timing: string; firstIn: string; lastOut: string }[],
 *   permissions: unknown[],
 *   swipes: AttendanceSwipe[],
 * }} AttendanceDayDetail
 */

/**
 * @typedef {{
 *   date: string,
 *   name: string,
 *   dayOfWeek: string,
 *   applicationStatus: 'none' | 'applied' | 'applicable',
 * }} Holiday
 */

/**
 * @typedef {{
 *   employeeName: string,
 *   days: number,
 *   from: string,
 *   to: string,
 * }} LeaveTransaction
 */

/**
 * @typedef {{
 *   exceptionDays: number,
 *   avgWorkHrs: string,
 *   avgWorkHrsTrend: string,
 *   avgActualWorkHrs: string,
 *   avgActualWorkHrsTrend: string,
 *   penaltyDays: number,
 *   insightsCount: number,
 * }} AttendanceSummary
 */

/**
 * @typedef {{
 *   greeting: string,
 *   quote: string,
 *   attendance: { date: string; shift: string; signedIn: boolean },
 *   upcomingHolidays: Holiday[],
 *   quickLinks: { label: string; href: string }[],
 *   payslip: { month: string; paidDays: number; grossMasked: boolean },
 *   itDeclaration: { message: string; period: string },
 *   poi: { message: string },
 *   pendingLeaveCount: number,
 * }} EmployeeHomeData
 */

export {};
