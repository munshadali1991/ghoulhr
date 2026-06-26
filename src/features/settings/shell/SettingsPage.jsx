import { useEffect } from 'react';
import { Box, Alert, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_SETTINGS_SLUG,
  canAccessSettingsSlug,
  currentSettingsSlugFromPath,
  firstAllowedSettingsPath,
  isValidSettingsSlug,
  isWideSettingsLayout,
} from '@/features/settings/shell/settingsNav';
import { useAuth } from '@/app/providers/useAuth';
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
import { RbacSettingsPage } from '@/features/rbac/pages/RbacSettingsPage';
import { useSettingsSectionAccess } from '@/features/settings/hooks/useSettingsSectionAccess';

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
  const { session } = useAuth();
  const activeSlug = currentSettingsSlugFromPath(location.pathname) ?? DEFAULT_SETTINGS_SLUG;

  const orgForm = useOrganizationSettingsForm(organizationId);
  const { canWrite: canWriteOrganization } = useSettingsSectionAccess('organization');
  const isOrgProfileTab =
    activeSlug === DEFAULT_SETTINGS_SLUG &&
    organizationTabFromPath(location.pathname) === ORGANIZATION_TABS.profile;
  const showOrgDraftBar = isOrgProfileTab && orgForm.hasChanges && canWriteOrganization;
  const pageMaxWidth = isWideSettingsLayout(activeSlug, location.pathname)
    ? SETTINGS_PAGE_WIDE_MAX_WIDTH
    : SETTINGS_PAGE_MAX_WIDTH;

  useEffect(() => {
    const slug = currentSettingsSlugFromPath(location.pathname);
    if (location.pathname === '/settings' || (slug && !isValidSettingsSlug(slug))) {
      navigate(firstAllowedSettingsPath(session), { replace: true });
      return;
    }
    if (slug && !canAccessSettingsSlug(session, slug)) {
      navigate(firstAllowedSettingsPath(session), { replace: true });
    }
  }, [location.pathname, navigate, session]);

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

      <SettingsPanel
        slug={activeSlug}
        pathname={location.pathname}
        organizationId={organizationId}
        orgForm={orgForm}
        session={session}
      />

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
 *   pathname: string,
 *   organizationId: string,
 *   orgForm: ReturnType<typeof useOrganizationSettingsForm>,
 *   session: import('@/app/providers/authContext').AuthSession | null | undefined,
 * }} props
 */
function SettingsPanel({ slug, pathname, organizationId, orgForm, session }) {
  if (!canAccessSettingsSlug(session, slug)) {
    return (
      <Alert severity="warning">You do not have permission to view this settings section.</Alert>
    );
  }

  const panel = (() => {
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
      case 'rbac':
        return <RbacSettingsPage key={pathname} />;
      default:
        return null;
    }
  })();

  return panel;
}
