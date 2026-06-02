export const ORGANIZATION_TABS = {
  profile: 'profile',
  calendar: 'calendar',
};

export const ORGANIZATION_PROFILE_PATH = '/settings/organization';
export const ORGANIZATION_CALENDAR_PATH = '/settings/organization/calendar';

export function organizationTabFromPath(pathname) {
  if (pathname.startsWith(ORGANIZATION_CALENDAR_PATH)) {
    return ORGANIZATION_TABS.calendar;
  }
  return ORGANIZATION_TABS.profile;
}

export function organizationPathForTab(tab) {
  return tab === ORGANIZATION_TABS.calendar
    ? ORGANIZATION_CALENDAR_PATH
    : ORGANIZATION_PROFILE_PATH;
}
