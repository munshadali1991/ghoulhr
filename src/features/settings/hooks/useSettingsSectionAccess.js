import { useMemo } from 'react';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import {
  canAccessSettingsSection,
  getSettingsSectionBySlug,
} from '@/features/auth/config/accessRegistry';

/**
 * @param {string} slug - settings section slug
 */
export function useSettingsSectionAccess(slug) {
  const { session, can } = useAuthorization();

  return useMemo(() => {
    const section = getSettingsSectionBySlug(slug);
    if (!section) {
      return { canRead: false, canWrite: false, section: null };
    }
    const canRead = canAccessSettingsSection(session, section);
    const canWrite = section.write ? can(section.write) : false;
    return { canRead, canWrite, section };
  }, [session, slug, can]);
}
