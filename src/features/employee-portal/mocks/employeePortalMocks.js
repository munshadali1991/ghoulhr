/** @type {import('../types/employeePortal.types').LeaveRequest[]} */
export const MOCK_LEAVE_REQUESTS = [
  {
    id: 'lr-1',
    category: 'Leave',
    leaveType: 'Earned-Casual-Medical-Privilege',
    status: 'PENDING',
    daysCount: 2,
    approverName: 'Awanish Kumar Shukla',
    duration: {
      startDate: '2026-05-14',
      endDate: '2026-05-15',
      startSession: 'Session 1',
      endSession: 'Session 2',
    },
    reason: 'My son is hospitalized he is not well.',
    appliedOn: '2026-05-14',
  },
  {
    id: 'lr-2',
    category: 'Leave',
    leaveType: 'Earned-Casual-Medical-Privilege',
    status: 'PENDING',
    daysCount: 1,
    approverName: 'Awanish Kumar Shukla',
    duration: {
      startDate: '2026-05-20',
      endDate: '2026-05-20',
      startSession: 'Session 1',
      endSession: 'Session 1',
    },
    reason: 'Personal work',
    appliedOn: '2026-05-19',
  },
  {
    id: 'lr-3',
    category: 'Leave',
    leaveType: 'Earned-Casual-Medical-Privilege',
    status: 'APPROVED',
    daysCount: 0.5,
    duration: {
      startDate: '2026-04-10',
      endDate: '2026-04-10',
      startSession: 'Session 2',
      endSession: 'Session 2',
    },
    reason: '',
    appliedOn: '2026-04-08',
  },
  {
    id: 'lr-4',
    category: 'Restricted Holiday',
    leaveType: 'Good Friday',
    status: 'APPROVED',
    daysCount: 1,
    duration: {
      startDate: '2026-04-24',
      endDate: '2026-04-24',
      startSession: 'Session 2',
      endSession: 'Session 2',
    },
    reason: '',
    appliedOn: '2026-04-20',
  },
];

/** @type {import('../types/employeePortal.types').LeaveBalance[]} */
export const MOCK_LEAVE_BALANCES = [
  { id: 'lb-1', name: 'Earned-Casual-Medical-Privilege', granted: 13.2, balance: 7.7, consumed: 5.5 },
  { id: 'lb-2', name: 'Comp - Off', granted: 0, balance: 0, consumed: 0 },
  { id: 'lb-3', name: 'Loss Of Pay', granted: 0, balance: 0, consumed: 0 },
  { id: 'lb-4', name: 'ML-PL-BL-LP', granted: 0, balance: 0, consumed: 0 },
];

export const MOCK_LEAVE_TYPES = [
  { value: 'earned-casual', label: 'Earned-Casual-Medical-Privilege' },
  { value: 'comp-off', label: 'Comp - Off' },
  { value: 'lop', label: 'Loss Of Pay' },
];

export const MOCK_APPROVERS = [
  { value: 'awanish', label: 'Awanish Kumar Shukla' },
  { value: 'hr', label: 'HR Manager' },
];

export const MOCK_SESSIONS = [
  { value: 'Session 1', label: 'Session 1' },
  { value: 'Session 2', label: 'Session 2' },
];

/** @type {Record<string, import('../types/employeePortal.types').CalendarDayMarker>} */
export function buildMockLeaveCalendarDays(year, month) {
  const markers = {};
  const holidays = {
    '2026-05-28': 'general',
  };
  for (let d = 1; d <= 31; d += 1) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (holidays[key]) {
      markers[key] = { date: key, holiday: holidays[key] };
    }
  }
  return markers;
}

/** @type {import('../types/employeePortal.types').LeaveTransaction[]} */
export const MOCK_LEAVE_TRANSACTIONS = [];

/** @returns {Record<number, import('../types/employeePortal.types').Holiday[]>} */
export function buildMockHolidayCalendar(_year) {
  return {
    0: [
      { date: '2026-01-01', name: 'New Year', dayOfWeek: 'Thu', applicationStatus: 'applicable' },
      { date: '2026-01-14', name: 'Makar Sankranti', dayOfWeek: 'Wed', applicationStatus: 'applicable' },
    ],
    2: [
      { date: '2026-03-30', name: 'Ugadi', dayOfWeek: 'Mon', applicationStatus: 'applicable' },
    ],
    3: [
      { date: '2026-04-18', name: 'Good Friday', dayOfWeek: 'Sat', applicationStatus: 'applied' },
    ],
    4: [
      { date: '2026-05-01', name: 'May Day', dayOfWeek: 'Fri', applicationStatus: 'applicable' },
    ],
    7: [
      { date: '2026-08-15', name: 'Independence Day', dayOfWeek: 'Sat', applicationStatus: 'applicable' },
    ],
    9: [
      { date: '2026-10-20', name: 'Dussehra', dayOfWeek: 'Tue', applicationStatus: 'applicable' },
    ],
    11: [
      { date: '2026-12-25', name: 'Christmas', dayOfWeek: 'Fri', applicationStatus: 'applicable' },
    ],
  };
}

/** @type {import('../types/employeePortal.types').AttendanceSummary} */
export const MOCK_ATTENDANCE_SUMMARY = {
  exceptionDays: 3,
  avgWorkHrs: '09:10',
  avgWorkHrsTrend: '-1% From April',
  avgActualWorkHrs: '09:10',
  avgActualWorkHrsTrend: '-1% From April',
  penaltyDays: 0,
  insightsCount: 3,
};

/**
 * @param {number} year
 * @param {number} month
 */
export function buildMockAttendanceDays(year, month) {
  /** @type {Record<string, import('../types/employeePortal.types').CalendarDayMarker>} */
  const days = {};
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dow === 0 || dow === 6) {
      days[key] = { date: key, status: 'R' };
    } else if (d === 12 || d === 19) {
      days[key] = { date: key, status: 'A', shiftCode: 'S313' };
    } else {
      days[key] = { date: key, status: 'P', shiftCode: 'S313', hasBreak: d % 7 === 0 };
    }
  }
  return days;
}

/** @type {import('../types/employeePortal.types').AttendanceDayDetail} */
export const MOCK_ATTENDANCE_DAY_DETAIL = {
  date: '2026-05-20',
  shiftName: 'Shift3-13(S313)',
  shiftTime: '13:00 to 22:00',
  scheme: 'Shift3-13 scheme Attendance Scheme',
  firstIn: '-',
  lastOut: '-',
  lateIn: '-',
  earlyOut: '-',
  totalWorkHrs: '-',
  breakHrs: '-',
  actualWork: '-',
  status: '-',
  remarks: '-',
  sessions: [],
};

/** @type {import('../types/employeePortal.types').EmployeeHomeData} */
export const MOCK_EMPLOYEE_HOME = {
  greeting: 'Good Evening',
  quote: 'Success is not final; failure is not fatal.',
  attendance: { date: 'Thu, 22 May 2026', shift: 'Shift3-13 (13:00 - 22:00)', signedIn: false },
  upcomingHolidays: [
    { date: '2026-08-15', name: 'Independence Day', dayOfWeek: 'Sat', applicationStatus: 'applicable' },
    { date: '2026-10-20', name: 'Dussehra', dayOfWeek: 'Tue', applicationStatus: 'applicable' },
    { date: '2026-12-25', name: 'Christmas', dayOfWeek: 'Fri', applicationStatus: 'applicable' },
  ],
  quickLinks: [
    { label: 'CTC Payslip', href: '#' },
    { label: 'Reimbursement Payslip', href: '#' },
    { label: 'IT Statement', href: '#' },
    { label: 'YTD Reports', href: '#' },
    { label: 'Loan Statement', href: '#' },
  ],
  payslip: { month: 'Apr 2026', paidDays: 30, grossMasked: true },
  itDeclaration: { message: 'Hurrah! Considered your IT declaration for Apr 2025.', period: 'Apr 2025' },
  poi: { message: 'Hold on! You can submit your Proof of Investments (POI) once released.' },
  pendingLeaveCount: 2,
};
