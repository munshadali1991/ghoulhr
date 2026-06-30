import {
  buildSettingsSections,
  canAccessSettingsSection,
  getSettingsSectionBySlug,
  SETTINGS_ACCESS,
  SETTINGS_SLUG_ORDER,
} from '@/features/auth/config/accessRegistry';
import { can, canAny } from '@/features/auth/utils/authorization';

/** URL segments under `/settings/:slug` for org admin settings. */
export const SETTINGS_SECTIONS = buildSettingsSections();

export const DEFAULT_SETTINGS_SLUG = 'organization';

export const DEFAULT_SETTINGS_PATH = `/settings/${DEFAULT_SETTINGS_SLUG}`;

export function settingsPath(slug) {
  return `/settings/${slug}`;
}

export function settingsNavChildren(session) {
  return SETTINGS_SLUG_ORDER.filter((slug) => {
    const section = SETTINGS_ACCESS[slug];
    return canAccessSettingsSection(session, section);
  }).map((slug) => {
    const section = SETTINGS_ACCESS[slug];
    return {
      key: `settings-${slug}`,
      label: section.label,
      path: settingsPath(slug),
    };
  });
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {string} slug
 */
export function canAccessSettingsSlug(session, slug) {
  const section = getSettingsSectionBySlug(slug);
  if (!section) return false;
  return canAccessSettingsSection(session, section);
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {string} slug
 */
export function canWriteSettingsSlug(session, slug) {
  const section = getSettingsSectionBySlug(slug);
  if (!section?.write) return false;
  if (!canAccessSettingsSection(session, section)) return false;
  return can(session, section.write);
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
  const idx = SETTINGS_SLUG_ORDER.indexOf(slug);
  return idx >= 0 ? idx : 0;
}

export function isValidSettingsSlug(slug) {
  return SETTINGS_SLUG_ORDER.includes(slug);
}

export function currentSettingsSlugFromPath(pathname) {
  const m = pathname.match(/^\/settings\/([^/]+)/);
  return m?.[1] ?? null;
}

/** True for /settings/organization and /settings/organization/calendar (etc.). */
export function isOrganizationSettingsPath(pathname) {
  return (
    pathname === '/settings/organization' ||
    pathname.startsWith('/settings/organization/')
  );
}

/** Settings tabs that use a wider content column (tables / dense forms). */
export const SETTINGS_WIDE_LAYOUT_SLUGS = new Set(['leave', 'attendance', 'rbac']);

export function isWideSettingsLayout(slug, pathname = '') {
  if (SETTINGS_WIDE_LAYOUT_SLUGS.has(slug)) {
    return true;
  }
  return slug === 'organization' && pathname.includes('/organization/calendar');
}

/**
 * Read permissions required for a settings slug (for route guards).
 * @param {string} slug
 * @returns {string[]}
 */
export function settingsSlugReadPermissions(slug) {
  const section = getSettingsSectionBySlug(slug);
  if (!section) return [];
  if (section.readAny?.length) return section.readAny;
  if (section.read) return [section.read];
  return [];
}

/**
 * @param {import('@/app/providers/authContext').AuthSession | null | undefined} session
 * @param {string} slug
 */
export function canAccessSettingsSlugWithAnyRead(session, slug) {
  const perms = settingsSlugReadPermissions(slug);
  if (!perms.length) return false;
  const section = getSettingsSectionBySlug(slug);
  if (section?.module && session && !session.entitledModules?.includes(section.module)) {
    return false;
  }
  return canAny(session, perms);
}
