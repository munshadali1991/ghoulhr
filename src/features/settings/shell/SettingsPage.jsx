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
import { OrganizationSettingsPage } from '@/features/settings/organization/OrganizationSettingsPage';
import { organizationTabFromPath, ORGANIZATION_TABS } from '@/features/settings/organization/organizationTabs';
import { EmployeeSettingsPage } from '@/features/settings/employees';
import { OrgStructurePage } from '@/features/settings/org-structure';
import { AttendanceSettingsPage } from '@/features/settings/attendance';
import { LocationsSettingsPage } from '@/features/settings/locations';
import { LeaveConfigSettingsPage } from '@/features/settings/leave';
import { TimesheetSettingsPage } from '@/features/settings/timesheet';

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
  const isOrgProfileTab =
    activeSlug === DEFAULT_SETTINGS_SLUG &&
    organizationTabFromPath(location.pathname) === ORGANIZATION_TABS.profile;
  const showOrgDraftBar = isOrgProfileTab && orgForm.hasChanges;
  const pageMaxWidth = isWideSettingsLayout(activeSlug, location.pathname)
    ? SETTINGS_PAGE_WIDE_MAX_WIDTH
    : SETTINGS_PAGE_MAX_WIDTH;

  useEffect(() => {
    const slug = currentSettingsSlugFromPath(location.pathname);
    if (location.pathname === '/settings' || (slug && !isValidSettingsSlug(slug))) {
      navigate(DEFAULT_SETTINGS_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  if (orgForm.isLoading && isOrgProfileTab) {
    return <SettingsPageSkeleton />;
  }

  return (
    <Box sx={settingsPageContainerSx(pageMaxWidth, showOrgDraftBar)}>
      {orgForm.successMessage && isOrgProfileTab && (
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
        <OrganizationSettingsPage organizationId={organizationId} orgForm={orgForm} />
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
    case 'timesheet':
      return <TimesheetSettingsPage organizationId={organizationId} />;
    default:
      return null;
  }
}
