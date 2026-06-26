import { Box } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { useEmployeeSettingsForm } from './hooks/useEmployeeSettingsForm';
import { EmployeeIdConfigSection } from './components/EmployeeIdConfigSection';
import { EmployeeSettingsLoadingSkeleton } from './components/EmployeeSettingsLoadingSkeleton';
import { EmployeeSettingsSaveBar } from './components/EmployeeSettingsSaveBar';
import { RequiredFieldsSection } from './components/RequiredFieldsSection';
import { useSettingsSectionAccess } from '@/features/settings/hooks/useSettingsSectionAccess';

/**
 * @param {{ organizationId: string }} props
 */
export function EmployeeSettingsPage({ organizationId }) {
  const form = useEmployeeSettingsForm(organizationId);
  const { canWrite } = useSettingsSectionAccess('employees');

  if (form.isLoading) {
    return <EmployeeSettingsLoadingSkeleton />;
  }

  return (
    <Box>
      <FormStatusAlerts
        loadError={form.error}
        loadErrorMessage="Failed to load employee settings. Please try again."
        formError={form.formError}
        onDismissFormError={form.dismissFormError}
        successMessage={form.successMessage}
      />

      <form onSubmit={form.handleSubmit(form.onSubmit)}>
        <EmployeeIdConfigSection
          register={form.register}
          control={form.control}
          errors={form.errors}
          readOnly={!canWrite}
        />
        <RequiredFieldsSection
          register={form.register}
          control={form.control}
          errors={form.errors}
          readOnly={!canWrite}
        />
        {canWrite ? (
          <EmployeeSettingsSaveBar
            isDirty={form.isDirty}
            isUpdating={form.isUpdating}
            onReset={form.handleReset}
          />
        ) : null}
      </form>
    </Box>
  );
}
