import { useEffect } from 'react';
import { Box, Alert, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_SETTINGS_PATH,
  DEFAULT_SETTINGS_SLUG,
  currentSettingsSlugFromPath,
  isValidSettingsSlug,
  isWideSettingsLayout,
} from '@/features/settings/shell/settingsNav';
import { DraftStatusBar } from '@/features/settings/shell/components/DraftStatusBar';
import {
  SETTINGS_PAGE_MAX_WIDTH,
  SETTINGS_PAGE_WIDE_MAX_WIDTH,
  settingsPageContainerSx,
} from '@/shared/components/settings/settingsLayout';
import { useOrganizationSettingsForm } from '@/features/settings/organization';
import { OrganizationSettingsContent } from '@/features/settings/organization';
import { EmployeeSettingsPage } from '@/features/settings/employees';
import { OrgStructurePage } from '@/features/settings/org-structure';
import { AttendanceSettingsPage } from '@/features/settings/attendance';
import { LocationsSettingsPage } from '@/features/settings/locations';
import { LeaveConfigSettingsPage } from '@/features/settings/leave';

function SettingsPageSkeleton() {
  return (
    <Box sx={{ maxWidth: SETTINGS_PAGE_MAX_WIDTH, mx: 'auto' }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

/**
 * @param {{ organizationId: string }} props
 */
export function SettingsPage({ organizationId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSlug = currentSettingsSlugFromPath(location.pathname) ?? DEFAULT_SETTINGS_SLUG;

  const orgForm = useOrganizationSettingsForm(organizationId);
  const showOrgDraftBar = activeSlug === DEFAULT_SETTINGS_SLUG && orgForm.hasChanges;
  const pageMaxWidth = isWideSettingsLayout(activeSlug)
    ? SETTINGS_PAGE_WIDE_MAX_WIDTH
    : SETTINGS_PAGE_MAX_WIDTH;

  useEffect(() => {
    const slug = currentSettingsSlugFromPath(location.pathname);
    if (location.pathname === '/settings' || (slug && !isValidSettingsSlug(slug))) {
      navigate(DEFAULT_SETTINGS_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  if (orgForm.isLoading && activeSlug === DEFAULT_SETTINGS_SLUG) {
    return <SettingsPageSkeleton />;
  }

  return (
    <Box sx={settingsPageContainerSx(pageMaxWidth, showOrgDraftBar)}>
      {orgForm.successMessage && activeSlug === DEFAULT_SETTINGS_SLUG && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          {orgForm.successMessage}
        </Alert>
      )}

      <SettingsPanel slug={activeSlug} organizationId={organizationId} orgForm={orgForm} />

      {showOrgDraftBar && (
        <DraftStatusBar
          hasChanges={orgForm.hasChanges}
          isPublishing={orgForm.isPublishing}
          onPublish={orgForm.handlePublish}
          onDiscard={orgForm.handleDiscard}
          changeCount={orgForm.changeCount}
          maxWidth={pageMaxWidth}
        />
      )}
    </Box>
  );
}

/**
 * @param {{
 *   slug: string,
 *   organizationId: string,
 *   orgForm: ReturnType<typeof useOrganizationSettingsForm>,
 * }} props
 */
function SettingsPanel({ slug, organizationId, orgForm }) {
  switch (slug) {
    case 'organization':
      return (
        <OrganizationSettingsContent
          register={orgForm.register}
          errors={orgForm.errors}
          logoPreview={orgForm.logoPreview}
          onLogoUpload={orgForm.handleLogoUpload}
        />
      );
    case 'employees':
      return <EmployeeSettingsPage organizationId={organizationId} />;
    case 'departments':
      return <OrgStructurePage organizationId={organizationId} />;
    case 'locations':
      return <LocationsSettingsPage organizationId={organizationId} />;
    case 'leave':
      return <LeaveConfigSettingsPage organizationId={organizationId} />;
    case 'attendance':
      return <AttendanceSettingsPage organizationId={organizationId} />;
    default:
      return null;
  }
}
