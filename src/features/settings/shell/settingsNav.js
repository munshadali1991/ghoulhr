/** URL segments under `/settings/:slug` for org admin settings. */
export const SETTINGS_SECTIONS = [
  { slug: 'organization', label: 'Organization', module: 'settings', permission: 'settings.organization:read' },
  { slug: 'employees', label: 'Employees', module: 'settings', permission: 'settings.employees:read' },
  { slug: 'departments', label: 'Departments & Designations', module: 'employees', permission: 'employees:read' },
  { slug: 'locations', label: 'Locations', module: 'settings', permission: 'settings.locations:read' },
  { slug: 'leave', label: 'Leave config', module: 'settings', permission: 'settings.leave:read' },
  { slug: 'attendance', label: 'Attendance', module: 'settings', permission: 'settings.attendance:read' },
  { slug: 'timesheet', label: 'Timesheet', module: 'timesheet', permission: 'settings.timesheet:read' },
  { slug: 'rbac', label: 'Roles & Permissions', module: 'rbac', permission: 'rbac:read' },
];

export const DEFAULT_SETTINGS_SLUG = 'organization';

export const DEFAULT_SETTINGS_PATH = `/settings/${DEFAULT_SETTINGS_SLUG}`;

export function settingsPath(slug) {
  return `/settings/${slug}`;
}

export function settingsNavChildren(session) {
  return SETTINGS_SECTIONS.filter((section) => {
    if (section.module && session && !session.entitledModules?.includes(section.module)) {
      return false;
    }
    if (section.permission && session && !session.permissions?.includes(section.permission)) {
      return false;
    }
    return true;
  }).map(({ slug, label }) => ({
    key: `settings-${slug}`,
    label,
    path: settingsPath(slug),
  }));
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 */
export function canAccessSettingsSlug(session, slug) {
  const section = SETTINGS_SECTIONS.find((s) => s.slug === slug);
  if (!section) return false;
  if (section.module && session && !session.entitledModules?.includes(section.module)) {
    return false;
  }
  if (section.permission && session && !session.permissions?.includes(section.permission)) {
    return false;
  }
  return true;
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 */
export function firstAllowedSettingsPath(session) {
  const children = settingsNavChildren(session);
  return children[0]?.path ?? DEFAULT_SETTINGS_PATH;
}

export function settingsTabIndexFromPath(pathname) {
  const m = pathname.match(/^\/settings\/([^/]+)\/?/);
  const slug = m?.[1] ?? DEFAULT_SETTINGS_SLUG;
  const idx = SETTINGS_SECTIONS.findIndex((s) => s.slug === slug);
  return idx >= 0 ? idx : 0;
}

export function isValidSettingsSlug(slug) {
  return SETTINGS_SECTIONS.some((s) => s.slug === slug);
}

export function currentSettingsSlugFromPath(pathname) {
  const m = pathname.match(/^\/settings\/([^/]+)\/?/);
  return m?.[1] ?? null;
}

/** Settings tabs that use a wider content column (tables / dense forms). */
export const SETTINGS_WIDE_LAYOUT_SLUGS = new Set(['leave', 'attendance', 'rbac']);

export function isWideSettingsLayout(slug, pathname = '') {
  if (SETTINGS_WIDE_LAYOUT_SLUGS.has(slug)) {
    return true;
  }
  return slug === 'organization' && pathname.includes('/organization/calendar');
}
