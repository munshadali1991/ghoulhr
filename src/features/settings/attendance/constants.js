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
  { value: 'manual', label: 'Manual' },
  { value: 'biometric', label: 'Biometric' },
  { value: 'geo', label: 'Geo' },
  { value: 'ip', label: 'IP-based' },
];

export const ATTENDANCE_CLOCK_STORAGE_KEY = 'ghoulhr-attendance-clock-format';
