import {
  MOCK_LEAVE_REQUESTS,
  MOCK_LEAVE_BALANCES,
  MOCK_LEAVE_TYPES,
  MOCK_APPROVERS,
  MOCK_ATTENDANCE_SUMMARY,
  MOCK_ATTENDANCE_DAY_DETAIL,
  MOCK_EMPLOYEE_HOME,
  MOCK_LEAVE_TRANSACTIONS,
  buildMockLeaveCalendarDays,
  buildMockHolidayCalendar,
  buildMockAttendanceDays,
} from '../mocks/employeePortalMocks';

const USE_MOCK = import.meta.env.VITE_EMPLOYEE_PORTAL_MOCK !== 'false';

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

/** In-memory store for mock mutations */
let mockLeaveRequests = [...MOCK_LEAVE_REQUESTS];

/**
 * @param {'PENDING' | 'APPROVED' | 'REJECTED'} status
 */
export async function fetchLeaveRequests(status) {
  await delay();
  if (!USE_MOCK) {
    throw new Error('Employee leave API not configured. Set VITE_EMPLOYEE_PORTAL_MOCK=true or implement backend.');
  }
  return mockLeaveRequests.filter((r) => r.status === status);
}

export async function fetchLeaveBalances(year) {
  await delay();
  if (!USE_MOCK) throw new Error('Employee leave balances API not configured.');
  return { year, balances: MOCK_LEAVE_BALANCES };
}

export async function fetchLeaveTypes() {
  await delay(120);
  if (!USE_MOCK) throw new Error('Employee leave types API not configured.');
  return { types: MOCK_LEAVE_TYPES, approvers: MOCK_APPROVERS };
}

/**
 * @param {number} year
 * @param {number} month
 * @param {string} filter
 */
export async function fetchLeaveCalendar(year, month, filter) {
  await delay();
  if (!USE_MOCK) throw new Error('Employee leave calendar API not configured.');
  return {
    year,
    month,
    filter,
    days: buildMockLeaveCalendarDays(year, month),
  };
}

/**
 * @param {string} date
 * @param {string} filter
 * @param {string} [search]
 */
export async function fetchLeaveTransactions(date, filter, search = '') {
  await delay(200);
  if (!USE_MOCK) throw new Error('Employee leave transactions API not configured.');
  const items = MOCK_LEAVE_TRANSACTIONS.filter((t) => {
    if (!search) return true;
    return t.employeeName.toLowerCase().includes(search.toLowerCase());
  });
  return { date, filter, items };
}

export async function fetchHolidayCalendar(year) {
  await delay();
  if (!USE_MOCK) throw new Error('Employee holiday calendar API not configured.');
  return { year, months: buildMockHolidayCalendar(year) };
}

/**
 * @param {object} payload
 */
export async function submitLeaveRequest(payload) {
  await delay(400);
  if (!USE_MOCK) throw new Error('Submit leave API not configured.');
  const newRequest = {
    id: `lr-${Date.now()}`,
    category: 'Leave',
    leaveType: payload.leaveTypeLabel ?? payload.leaveType,
    status: 'PENDING',
    daysCount: 1,
    approverName: payload.approverLabel ?? 'Manager',
    duration: {
      startDate: payload.fromDate,
      endDate: payload.toDate,
      startSession: payload.fromSession,
      endSession: payload.toSession,
    },
    reason: payload.reason,
    appliedOn: new Date().toISOString().slice(0, 10),
  };
  mockLeaveRequests = [newRequest, ...mockLeaveRequests];
  return newRequest;
}

export async function withdrawLeaveRequest(id) {
  await delay(300);
  if (!USE_MOCK) throw new Error('Withdraw leave API not configured.');
  mockLeaveRequests = mockLeaveRequests.filter((r) => r.id !== id);
  return { success: true };
}

/**
 * @param {number} year
 * @param {number} month
 */
export async function fetchAttendanceSummary(year, month) {
  await delay();
  if (!USE_MOCK) throw new Error('Attendance summary API not configured.');
  return { ...MOCK_ATTENDANCE_SUMMARY, year, month };
}

export async function fetchAttendanceDays(year, month) {
  await delay();
  if (!USE_MOCK) throw new Error('Attendance days API not configured.');
  return { year, month, days: buildMockAttendanceDays(year, month) };
}

export async function fetchAttendanceDayDetail(date) {
  await delay(200);
  if (!USE_MOCK) throw new Error('Attendance day API not configured.');
  return { ...MOCK_ATTENDANCE_DAY_DETAIL, date };
}

export async function fetchEmployeeHome() {
  await delay();
  if (!USE_MOCK) throw new Error('Employee home API not configured.');
  return MOCK_EMPLOYEE_HOME;
}

/** Reset mocks — useful for dev */
export function resetEmployeePortalMocks() {
  mockLeaveRequests = [...MOCK_LEAVE_REQUESTS];
}
