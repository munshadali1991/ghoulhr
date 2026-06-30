import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { APP_BRAND_INITIALS, APP_NAME } from '@/app/config/appConfig';
import { getOrgBranding } from '@/features/settings/api/settingsApi';

/**
 * Derive 1–2 letter initials from an organization display name.
 * @param {string} name
 */
function initialsFromName(name) {
  const trimmed = name?.trim();
  if (!trimmed) return APP_BRAND_INITIALS;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Organization branding for app shell (sidebar, header).
 * Uses the public branding endpoint so employees without settings permissions still see the org name.
 * @param {string | undefined} organizationId
 */
export function useOrganizationBranding(organizationId) {
  const { data: branding, isLoading } = useQuery({
    queryKey: ['settings', 'branding', organizationId],
    queryFn: () => getOrgBranding(organizationId),
    enabled: !!organizationId,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });

  return useMemo(() => {
    const name = typeof branding?.name === 'string' ? branding.name.trim() : '';
    const logo =
      typeof branding?.logo === 'string' && branding.logo ? branding.logo : null;
    const displayName = name || APP_NAME;
    const hasCustomName = Boolean(name);

    return {
      name,
      logo,
      displayName,
      initials: initialsFromName(displayName),
      hasCustomName,
      isLoading,
    };
  }, [branding?.name, branding?.logo, isLoading]);
}
