export const ATTENDANCE_TABS = {
  shifts: 'shifts',
  schedule: 'schedule',
  checkin: 'checkin',
};

export const WEEKDAYS = [
  { value: 'Mon', label: 'Monday', short: 'Mon' },
  { value: 'Tue', label: 'Tuesday', short: 'Tue' },
  { value: 'Wed', label: 'Wednesday', short: 'Wed' },
  { value: 'Thu', label: 'Thursday', short: 'Thu' },
  { value: 'Fri', label: 'Friday', short: 'Fri' },
  { value: 'Sat', label: 'Saturday', short: 'Sat' },
  { value: 'Sun', label: 'Sunday', short: 'Sun' },
];

export const TRACKING_MODES = [
  {
    value: 'manual',
    label: 'Manual',
    description: 'Employees record attendance themselves in the app.',
  },
  {
    value: 'biometric',
    label: 'Biometric',
    description: 'Attendance is captured from biometric devices.',
  },
  {
    value: 'geo',
    label: 'Geo',
    description: 'Check-in uses device location near a workplace.',
  },
  {
    value: 'ip',
    label: 'IP-based',
    description: 'Only allowlisted network addresses can check in.',
  },
];

export const ATTENDANCE_CLOCK_STORAGE_KEY = 'ghoulhr-attendance-clock-format';
