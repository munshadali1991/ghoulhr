/** URL segments under `/settings/:slug` for org admin settings. */
export const SETTINGS_SECTIONS = [
  { slug: 'organization', label: 'Organization' },
  { slug: 'employees', label: 'Employees' },
  { slug: 'departments', label: 'Departments & Designations' },
  { slug: 'locations', label: 'Locations' },
  { slug: 'leave', label: 'Leave config' },
  { slug: 'attendance', label: 'Attendance' },
  { slug: 'timesheet', label: 'Timesheet' },
];

export const DEFAULT_SETTINGS_SLUG = 'organization';

export const DEFAULT_SETTINGS_PATH = `/settings/${DEFAULT_SETTINGS_SLUG}`;

export function settingsPath(slug) {
  return `/settings/${slug}`;
}

export function settingsNavChildren() {
  return SETTINGS_SECTIONS.map(({ slug, label }) => ({
    key: `settings-${slug}`,
    label,
    path: settingsPath(slug),
  }));
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
export const SETTINGS_WIDE_LAYOUT_SLUGS = new Set(['leave', 'attendance']);

export function isWideSettingsLayout(slug, pathname = '') {
  if (SETTINGS_WIDE_LAYOUT_SLUGS.has(slug)) {
    return true;
  }
  return slug === 'organization' && pathname.includes('/organization/calendar');
}
