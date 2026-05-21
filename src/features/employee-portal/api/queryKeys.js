export const employeePortalKeys = {
  all: ['employee-portal'],
  leaveRequests: (status) => [...employeePortalKeys.all, 'leave-requests', status],
  leaveBalances: (year) => [...employeePortalKeys.all, 'leave-balances', year],
  leaveCalendar: (year, month, filter) => [...employeePortalKeys.all, 'leave-calendar', year, month, filter],
  leaveTransactions: (date, filter) => [...employeePortalKeys.all, 'leave-transactions', date, filter],
  holidayCalendar: (year) => [...employeePortalKeys.all, 'holiday-calendar', year],
  attendanceSummary: (year, month) => [...employeePortalKeys.all, 'attendance-summary', year, month],
  attendanceDays: (year, month) => [...employeePortalKeys.all, 'attendance-days', year, month],
  attendanceDay: (date) => [...employeePortalKeys.all, 'attendance-day', date],
  home: () => [...employeePortalKeys.all, 'home'],
  leaveTypes: () => [...employeePortalKeys.all, 'leave-types'],
};
