export const DEFAULT_TIMESHEET_SETTINGS_FORM = {
  max_hours_per_day: 12,
  max_past_days: 7,
  require_submission_by_eod: true,
  employee_helper_text: '',
  week_starts_on: 1,
};

export const TIMESHEET_SETTINGS_SUCCESS_MS = 4000;

export const WEEK_START_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];
