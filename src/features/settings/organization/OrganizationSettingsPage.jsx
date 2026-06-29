import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import {
  ORGANIZATION_TABS,
  ORGANIZATION_PROFILE_PATH,
} from './organizationTabs';
import { OrganizationSettingsToolbar } from './components/OrganizationSettingsToolbar';
import { OrganizationProfileTab } from './components/OrganizationProfileTab';
import { OrganizationProfileSkeleton } from './components/OrganizationProfileSkeleton';
import { OrganizationCalendarTab } from './calendar/OrganizationCalendarTab';
import { useSettingsSectionAccess } from '@/features/settings/hooks/useSettingsSectionAccess';

/**
 * @param {{
 *   orgForm: ReturnType<import('./hooks/useOrganizationSettingsForm').useOrganizationSettingsForm>,
 *   canWrite: boolean,
 * }} props
 */
function OrganizationProfileRoute({ orgForm, canWrite }) {
  return (
    <>
      <FormStatusAlerts
        formError={orgForm.formError}
        onDismissFormError={orgForm.dismissFormError}
        successMessage={orgForm.successMessage}
      />
      {orgForm.isLoading ? (
        <OrganizationProfileSkeleton />
      ) : (
        <OrganizationProfileTab
          register={orgForm.register}
          control={orgForm.control}
          errors={orgForm.errors}
          logoPreview={orgForm.logoPreview}
          onLogoUpload={orgForm.handleLogoUpload}
          formValues={orgForm.formValues}
          readOnly={!canWrite}
          hasChanges={orgForm.hasChanges}
          isSaving={orgForm.isPublishing}
          onSave={orgForm.handlePublish}
          onDiscard={orgForm.handleDiscard}
        />
      )}
    </>
  );
}

/**
 * @param {string} orgSubPath
 */
function organizationTabFromSubPath(orgSubPath) {
  if (orgSubPath === 'calendar' || orgSubPath.startsWith('calendar/')) {
    return ORGANIZATION_TABS.calendar;
  }
  return ORGANIZATION_TABS.profile;
}

/**
 * @param {{
 *   organizationId: string,
 *   orgForm: ReturnType<import('./hooks/useOrganizationSettingsForm').useOrganizationSettingsForm>,
 *   orgSubPath?: string,
 * }} props
 */
export function OrganizationSettingsPage({ organizationId, orgForm, orgSubPath = '' }) {
  const activeTab = organizationTabFromSubPath(orgSubPath);
  const { canWrite } = useSettingsSectionAccess('organization');

  const [calendarMeta, setCalendarMeta] = useState({ status: null, holidayCount: 0 });
  const [addHolidayNonce, setAddHolidayNonce] = useState(0);

  const isCalendar = activeTab === ORGANIZATION_TABS.calendar;

  const handleCalendarMetaChange = useCallback((meta) => {
    setCalendarMeta(meta);
  }, []);

  const handleAddHoliday = useCallback(() => {
    setAddHolidayNonce((n) => n + 1);
  }, []);

  if (orgSubPath && orgSubPath !== 'calendar' && !orgSubPath.startsWith('calendar/')) {
    return <Navigate to={ORGANIZATION_PROFILE_PATH} replace />;
  }

  return (
    <Box
      data-testid={
        activeTab === ORGANIZATION_TABS.calendar
          ? 'settings-organization-calendar-page'
          : 'settings-organization-page'
      }
    >      <OrganizationSettingsToolbar
        activeTab={activeTab}
        financialYearStartMonth={orgForm.formValues.financialYearStartMonth}
        calendarStatus={isCalendar ? calendarMeta.status : null}
        holidayCount={isCalendar ? calendarMeta.holidayCount : 0}
        showAddHoliday={isCalendar && canWrite}
        onAddHoliday={handleAddHoliday}
      />

      <Box key={activeTab}>
        {activeTab === ORGANIZATION_TABS.profile ? (
          <OrganizationProfileRoute orgForm={orgForm} canWrite={canWrite} />
        ) : (
          <OrganizationCalendarTab
            organizationId={organizationId}
            addHolidayNonce={addHolidayNonce}
            onMetaChange={handleCalendarMetaChange}
            canWrite={canWrite}
          />
        )}
      </Box>
    </Box>
  );
}
