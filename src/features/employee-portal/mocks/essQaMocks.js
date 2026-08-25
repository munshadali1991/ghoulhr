/**
 * Edge-case-heavy QA fixtures for Who is In, Employee Swipes,
 * Team On Leave, and Leave Calendar.
 *
 * Enable with: VITE_ESS_QA_MOCKS=true
 * Optional scenario: VITE_ESS_QA_MOCK_SCENARIO=stress|empty|leap
 *   stress (default) — mixed TZ punches, long names, half-days, night shift, large lists
 *   empty — zero-record payloads
 *   leap — Feb 2024 leap-month calendar + leave spanning Feb 29
 */

const LONG_NAME =
  'Alexandria Chrysanthemum Wellington-Smythe von Habsburg III';
const LONG_TITLE =
  'Principal Distinguished Staff Engineer — Platform Reliability & Global Workforce Systems';

/** @returns {'stress' | 'empty' | 'leap'} */
export function getEssQaMockScenario() {
  const raw = String(import.meta.env.VITE_ESS_QA_MOCK_SCENARIO || 'stress')
    .trim()
    .toLowerCase();
  if (raw === 'empty' || raw === 'leap') return raw;
  return 'stress';
}

export function isEssQaMocksEnabled() {
  return String(import.meta.env.VITE_ESS_QA_MOCKS || '').toLowerCase() === 'true';
}

function emptyWhoIsIn(date = '2026-02-28', timezone = 'Asia/Kolkata') {
  return {
    date,
    timezone,
    summary: {
      notYetIn: 0,
      late: 0,
      onTime: 0,
      outOfOffice: 0,
      total: 0,
      percentNotYetIn: 0,
      percentLate: 0,
      percentOnTime: 0,
      percentOutOfOffice: 0,
    },
    notYetIn: [],
    lateArrivals: [],
    onTime: [],
    outOfOffice: { onLeave: [], holiday: [], offDay: [], restDay: [] },
  };
}

/**
 * @param {string | undefined} date
 */
export function getMockWhoIsIn(date) {
  const scenario = getEssQaMockScenario();
  const timezone = 'Asia/Kolkata';
  const workDate = date || '2026-02-28';

  if (scenario === 'empty') {
    return emptyWhoIsIn(workDate, timezone);
  }

  const notYetIn = [
    {
      employeeId: 'e-nyi-1',
      name: LONG_NAME,
      employeeCode: 'E-90001',
      initials: 'AW',
      designation: LONG_TITLE,
      location: 'Bengaluru HQ — Wing B / Floor 12 / Desk Cluster Omega',
      email: 'alexandria.wellington@example-corp.invalid',
      phone: '+91-98765-43210',
      shiftName: 'Night Shift (22:00–06:00)',
      shiftTime: '10:00 PM – 6:00 AM',
    },
    {
      employeeId: 'e-nyi-2',
      name: 'Priya',
      employeeCode: null,
      initials: 'P',
      designation: null,
      location: null,
      email: null,
      phone: null,
      shiftName: null,
      shiftTime: null,
    },
  ];

  const lateArrivals = [
    {
      employeeId: 'e-late-1',
      name: 'Jordan Lee',
      employeeCode: 'E-PST01',
      initials: 'JL',
      designation: 'Analyst',
      location: 'Seattle (PST)',
      email: 'jordan@example.com',
      phone: '+1-206-555-0100',
      shiftName: 'General',
      shiftTime: '09:00 – 18:00',
      firstIn: '09:47',
      lateInMinutes: 47,
    },
  ];

  const onTime = [
    {
      employeeId: 'e-ot-1',
      name: 'Samira Khan',
      employeeCode: 'E-IST02',
      initials: 'SK',
      designation: 'HR Business Partner',
      location: 'Mumbai',
      email: 'samira@example.com',
      phone: '',
      shiftName: 'General',
      shiftTime: '09:30 – 18:30',
      firstIn: '09:28',
    },
  ];

  const onLeave = [
    {
      employeeId: 'e-leave-1',
      name: 'Half Day Patel',
      employeeCode: 'E-HD01',
      initials: 'HP',
      designation: 'Designer',
      location: 'Pune',
      email: 'half@example.com',
      phone: '9999999999',
      daysCount: 0.5,
      leaveDates: '28 Feb 2026 (Session 2)',
      leaveType: 'Earned-Casual-Medical-Privilege',
      status: 'APPROVED',
      shiftName: 'General',
      shiftTime: '09:00 – 18:00',
    },
    {
      employeeId: 'e-leave-2',
      name: 'Multi Week Traveler',
      employeeCode: 'E-MW01',
      initials: 'MT',
      designation: 'Consultant',
      location: 'Remote UTC',
      email: 'mw@example.com',
      phone: null,
      daysCount: 14,
      leaveDates: '16 Feb 2026 – 01 Mar 2026',
      leaveType: 'Privilege Leave',
      status: 'APPROVED',
      shiftName: null,
      shiftTime: null,
    },
  ];

  if (scenario === 'leap' && workDate.startsWith('2024-02')) {
    onLeave.push({
      employeeId: 'e-leap-1',
      name: 'Leap Day Leave',
      employeeCode: 'E-LEAP',
      initials: 'LD',
      designation: 'Accountant',
      location: 'Delhi',
      email: 'leap@example.com',
      phone: null,
      daysCount: 3,
      leaveDates: '28 Feb 2024 – 01 Mar 2024',
      leaveType: 'Casual Leave',
      status: 'APPROVED',
      shiftName: 'General',
      shiftTime: '09:00 – 18:00',
    });
  }

  const total =
    notYetIn.length + lateArrivals.length + onTime.length + onLeave.length + 1;
  const oooCount = onLeave.length + 1;

  return {
    date: workDate,
    timezone,
    summary: {
      notYetIn: notYetIn.length,
      late: lateArrivals.length,
      onTime: onTime.length,
      outOfOffice: oooCount,
      total,
      percentNotYetIn: Math.round((notYetIn.length / total) * 100),
      percentLate: Math.round((lateArrivals.length / total) * 100),
      percentOnTime: Math.round((onTime.length / total) * 100),
      percentOutOfOffice: Math.round((oooCount / total) * 100),
    },
    notYetIn,
    lateArrivals,
    onTime,
    outOfOffice: {
      onLeave,
      holiday: [
        {
          employeeId: 'e-hol-1',
          name: 'Festive Colleague',
          employeeCode: 'E-HOL1',
          initials: 'FC',
          designation: 'Ops',
          location: 'Chennai',
          email: 'festive@example.com',
          phone: null,
        },
      ],
      offDay: [],
      restDay: [],
    },
  };
}

const SWIPE_POOL = (() => {
  const rows = [];
  const zones = [
    { label: 'IST', offsetNote: 'Asia/Kolkata wall clock' },
    { label: 'UTC', offsetNote: 'UTC wall clock' },
    { label: 'PST', offsetNote: 'America/Los_Angeles wall clock' },
  ];
  for (let i = 0; i < 85; i += 1) {
    const zone = zones[i % 3];
    const isNight = i % 11 === 0;
    const isOutMissing = i % 17 === 0;
    const long = i % 13 === 0;
    rows.push({
      id: `swipe-${i + 1}`,
      employeeId: `e-sw-${i + 1}`,
      name: long ? LONG_NAME : `Employee ${String(i + 1).padStart(3, '0')} (${zone.label})`,
      employeeCode: i % 19 === 0 ? null : `E-${1000 + i}`,
      initials: long ? 'AW' : `E${(i % 9) + 1}`,
      punchedAt: isNight
        ? '2026-02-27T22:15:00.000Z'
        : `2026-02-28T${String(3 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00.000Z`,
      swipeTime: isNight ? '03:45:00' : `${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 3) % 60).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      swipeDate: isNight ? '28 Feb 2026' : '28 Feb 2026',
      receivedAt: '2026-02-28T04:00:00.000Z',
      receivedTime: isNight ? '03:45:12' : null,
      receivedDate: isNight ? '28 Feb 2026' : '28 Feb 2026',
      punchType: isOutMissing ? 'IN' : i % 2 === 0 ? 'IN' : 'OUT',
      source: i % 5 === 0 ? 'WEB' : 'DEVICE',
      sourceLabel: i % 5 === 0 ? 'Web sign in' : 'Access device',
      shiftName: isNight ? 'Night Shift (22:00–06:00)' : i % 23 === 0 ? null : 'General',
      doorAddress: i % 5 === 0 ? null : `Gate ${ (i % 6) + 1 }`,
      deviceName: i % 5 === 0 ? null : `Reader-${zone.label}-${i % 4}`,
      accessCard: i % 5 === 0 ? null : `AC-${9000 + i}`,
      remarks: i % 29 === 0 ? 'Late night close spanning midnight' : null,
      deviceId: i % 5 === 0 ? null : `dev-${zone.label.toLowerCase()}-${i}`,
      locationSummary:
        i % 5 === 0
          ? null
          : `${zone.offsetNote} · Building ${(i % 3) + 1}`,
    });
  }
  return rows;
})();

/**
 * @param {{ from: string, to: string, q?: string, punchType?: string, page?: number, pageSize?: number }} params
 */
export function getMockEmployeeSwipes(params) {
  if (getEssQaMockScenario() === 'empty') {
    return {
      from: params.from,
      to: params.to,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
      total: 0,
      items: [],
    };
  }

  let items = [...SWIPE_POOL];
  if (params.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (r) =>
        String(r.name).toLowerCase().includes(q) ||
        String(r.employeeCode || '')
          .toLowerCase()
          .includes(q),
    );
  }
  if (params.punchType) {
    items = items.filter((r) => r.punchType === params.punchType);
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 50;
  const start = (page - 1) * pageSize;
  return {
    from: params.from,
    to: params.to,
    page,
    pageSize,
    total: items.length,
    items: items.slice(start, start + pageSize),
  };
}

export function getMockTeamOnLeave() {
  const timezone = 'Asia/Kolkata';
  if (getEssQaMockScenario() === 'empty') {
    return { hasTeam: true, today: [], thisMonth: [], timezone };
  }

  return {
    hasTeam: true,
    timezone,
    today: [
      {
        employeeId: 'e-leave-1',
        name: 'Half Day Patel',
        employeeCode: 'E-HD01',
        initials: 'HP',
      },
      {
        employeeId: 'e-long',
        name: LONG_NAME,
        employeeCode: '',
        initials: 'AW',
      },
    ],
    thisMonth: [
      {
        employeeId: 'e-leave-1',
        name: 'Half Day Patel',
        employeeCode: 'E-HD01',
        initials: 'HP',
        days: 0.5,
        dates: ['2026-02-28'],
      },
      {
        employeeId: 'e-leave-2',
        name: 'Multi Week Traveler',
        employeeCode: 'E-MW01',
        initials: 'MT',
        days: 14,
        dates: [
          '2026-02-16',
          '2026-02-17',
          '2026-02-18',
          '2026-02-19',
          '2026-02-20',
          '2026-02-21',
          '2026-02-22',
          '2026-02-23',
          '2026-02-24',
          '2026-02-25',
          '2026-02-26',
          '2026-02-27',
          '2026-02-28',
          '2026-03-01',
        ],
      },
      {
        employeeId: 'e-long',
        name: LONG_NAME,
        employeeCode: '',
        initials: 'AW',
        days: 2,
        dates: ['2026-01-31', '2026-02-01'],
      },
      {
        employeeId: 'e-back',
        name: 'Back To Back Holiday',
        employeeCode: 'E-BTB',
        initials: 'BB',
        days: 1,
        dates: ['2026-02-27'],
      },
    ],
  };
}

/**
 * @param {{ from: string, to: string, type?: string }} params
 */
export function getMockTeamOnLeaveChart(params) {
  const timezone = 'Asia/Kolkata';
  const chartType = params.type || 'all';
  const from = params.from;
  const to = params.to;

  if (getEssQaMockScenario() === 'empty') {
    return {
      from,
      to,
      type: chartType,
      timezone,
      series: [],
      points: [],
      breakdownByDate: {},
      listRows: [],
    };
  }

  const series = [
    { key: 'leave:privilege-leave', label: 'Privilege Leave', kind: 'leave' },
    { key: 'leave:earned-casual', label: 'Earned Casual', kind: 'leave' },
    { key: 'restricted-holiday', label: 'Restricted Holiday', kind: 'holiday' },
  ];

  const points = [];
  const breakdownByDate = {};
  const listRows = [];
  const start = new Date(`${from}T12:00:00.000Z`);
  const end = new Date(`${to}T12:00:00.000Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const day = d.getUTCDate();
    const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const leaveVal = day % 5 === 0 ? 2 : day % 3 === 0 ? 1 : 0;
    const holidayVal = key === '2026-02-27' ? 3 : 0;
    points.push({
      date: key,
      label: `${day} ${month}`,
      values: {
        'leave:privilege-leave': leaveVal > 1 ? 1 : 0,
        'leave:earned-casual': leaveVal >= 1 ? leaveVal === 1 ? 0.5 : 1 : 0,
        'restricted-holiday': holidayVal,
      },
    });
    breakdownByDate[key] = {
      leave:
        leaveVal > 0
          ? [
              {
                employeeId: 'e-leave-2',
                name: 'Multi Week Traveler',
                employeeCode: 'E-MW01',
                leaveType: 'Privilege Leave',
                from: '2026-02-16',
                to: '2026-03-01',
                days: 14,
              },
              ...(leaveVal > 1
                ? [
                    {
                      employeeId: 'e-leave-1',
                      name: 'Half Day Patel',
                      employeeCode: 'E-HD01',
                      leaveType: 'Earned Casual',
                      from: key,
                      to: key,
                      days: 0.5,
                    },
                  ]
                : []),
            ]
          : [],
      holiday:
        holidayVal > 0
          ? [
              {
                employeeId: 'e-btb-1',
                name: LONG_NAME,
                employeeCode: null,
                holidayName: 'Company Foundation Eve',
                holidayType: 'RESTRICTED',
              },
            ]
          : [],
    };
    if (leaveVal > 0) {
      listRows.push({
        date: key,
        employeeId: 'e-leave-2',
        name: 'Multi Week Traveler',
        employeeCode: 'E-MW01',
        kind: 'leave',
        typeLabel: 'Privilege Leave',
        from: '2026-02-16',
        to: '2026-03-01',
        days: 14,
      });
    }
  }

  const includeLeave = chartType === 'all' || chartType === 'leave';
  const includeHoliday = chartType === 'all' || chartType === 'holiday';
  const filteredSeries = series.filter((s) =>
    s.kind === 'leave' ? includeLeave : includeHoliday,
  );

  return {
    from,
    to,
    type: chartType,
    timezone,
    series: filteredSeries,
    points: points.map((p) => {
      const values = { ...p.values };
      if (!includeLeave) {
        delete values['leave:privilege-leave'];
        delete values['leave:earned-casual'];
      }
      if (!includeHoliday) delete values['restricted-holiday'];
      return { ...p, values };
    }),
    breakdownByDate,
    listRows: includeLeave ? listRows : [],
  };
}

/**
 * @param {number} year
 * @param {number} month
 * @param {string} filter
 */
export function getMockLeaveCalendar(year, month, filter) {
  const timezone = 'Asia/Kolkata';
  const monthPad = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();

  if (getEssQaMockScenario() === 'empty') {
    return {
      year,
      month,
      filter,
      timezone,
      days: {},
      teamOnLeaveCount: 0,
    };
  }

  /** @type {Record<string, object>} */
  const days = {};

  // Back-to-back holidays near month boundary
  const holidayA = `${year}-${monthPad}-${String(Math.min(27, lastDay)).padStart(2, '0')}`;
  const holidayB = `${year}-${monthPad}-${String(Math.min(28, lastDay)).padStart(2, '0')}`;
  days[holidayA] = { date: holidayA, holiday: 'restricted' };
  days[holidayB] = { date: holidayB, holiday: 'general' };

  // Leap-day marker when applicable
  if (month === 2 && lastDay === 29) {
    days[`${year}-02-29`] = {
      date: `${year}-02-29`,
      onLeave: true,
      onLeaveCount: filter === 'team' ? 4 : 1,
      holiday: undefined,
    };
  }

  // Multi-week leave markers mid-month
  for (let d = 16; d <= Math.min(28, lastDay); d += 1) {
    const key = `${year}-${monthPad}-${String(d).padStart(2, '0')}`;
    const existing = days[key] || { date: key };
    days[key] = {
      ...existing,
      onLeave: true,
      onLeaveCount:
        filter === 'team' ? (d === 28 ? 12 : 3 + (d % 4)) : 1,
    };
  }

  // Half-day self marker
  const halfKey = `${year}-${monthPad}-${String(Math.min(10, lastDay)).padStart(2, '0')}`;
  days[halfKey] = {
    ...(days[halfKey] || { date: halfKey }),
    onLeave: true,
    onLeaveCount: filter === 'team' ? 2 : 1,
  };

  return {
    year,
    month,
    filter,
    timezone,
    days,
    teamOnLeaveCount: filter === 'team' ? 18 : 0,
  };
}

/**
 * @param {string} date
 * @param {string} filter
 * @param {string} [search]
 */
/**
 * Holidays for a date, aligned with getMockLeaveCalendar day markers
 * (restricted on min(27,lastDay), general on min(28,lastDay)).
 * @param {string} date YYYY-MM-DD
 */
function getMockHolidaysForDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!match) return [];
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const lastDay = new Date(year, month, 0).getDate();
  const restrictedDay = Math.min(27, lastDay);
  const generalDay = Math.min(28, lastDay);
  /** @type {Array<{id: string, name: string, holidayType: string, locationLabel: string}>} */
  const holidays = [];
  if (day === restrictedDay && restrictedDay !== generalDay) {
    holidays.push({
      id: 'mock-holiday-restricted',
      name: 'Mock Restricted Holiday',
      holidayType: 'Restricted Holiday',
      locationLabel: 'All locations',
    });
  }
  if (day === generalDay) {
    holidays.push({
      id: 'mock-holiday-general',
      name: 'Mock General Holiday',
      holidayType: 'General Holiday',
      locationLabel: 'All locations',
    });
  }
  return holidays;
}

export function getMockLeaveTransactions(date, filter, search = '') {
  if (getEssQaMockScenario() === 'empty') {
    return { date, filter, items: [], holidays: [] };
  }

  let items = [
    {
      id: 'lr-tx-1',
      employeeName: filter === 'me' ? 'You' : 'Half Day Patel',
      employeeCode: 'E-100',
      designation: 'Engineer',
      location: 'HQ',
      leaveType: 'Earned-Casual-Medical-Privilege',
      days: 0.5,
      from: date,
      to: date,
      durationLabel: 'First Half',
    },
    {
      id: 'lr-tx-2',
      employeeName: LONG_NAME,
      employeeCode: 'E-LONG',
      designation: LONG_TITLE,
      location: 'Remote — International',
      leaveType: 'Privilege Leave',
      days: 14,
      from: '2026-02-16',
      to: '2026-03-01',
      durationLabel: 'Full Day',
    },
    {
      id: 'lr-tx-3',
      employeeName: 'Same Day Double Booking',
      employeeCode: 'E-201',
      designation: 'Analyst',
      location: 'HQ',
      leaveType: 'Casual Leave',
      days: 1,
      from: date,
      to: date,
      durationLabel: 'Full Day',
    },
    {
      id: 'lr-tx-4',
      employeeName: 'Same Day Double Booking',
      employeeCode: 'E-201',
      designation: 'Analyst',
      location: 'HQ',
      leaveType: 'Comp - Off',
      days: 1,
      from: date,
      to: date,
      durationLabel: 'Full Day',
    },
  ];

  if (filter === 'me') {
    items = items.filter((i) => i.id === 'lr-tx-1');
  }

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((i) => i.employeeName.toLowerCase().includes(q));
  }

  return {
    date,
    filter,
    items,
    holidays: getMockHolidaysForDate(date),
  };
}
