import { Alert, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { LEAVE_WIZARD_LAST } from './constants';
import { useLeaveSettingsForm } from './hooks/useLeaveSettingsForm';
import { LeaveConfigLoadingSkeleton } from './components/LeaveConfigLoadingSkeleton';
import { LeaveTypeEditorWizard } from './components/LeaveTypeEditorWizard';
import { LeaveTypesListView } from './components/LeaveTypesListView';
import { LocationsRequiredEmpty } from './components/LocationsRequiredEmpty';
import { useSettingsSectionAccess } from '@/features/settings/hooks/useSettingsSectionAccess';

/**
 * @param {{ organizationId: string }} props
 */
export function LeaveConfigSettingsPage({ organizationId }) {
  const form = useLeaveSettingsForm(organizationId);
  const { canWrite } = useSettingsSectionAccess('leave');

  if (form.isLoading) {
    return <LeaveConfigLoadingSkeleton />;
  }

  const handleWizardSubmit = (e) => {
    if (form.wizardStep < LEAVE_WIZARD_LAST) {
      e.preventDefault();
      return;
    }
    form.handleSubmit(form.onSubmit)(e);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }} data-testid="settings-leave-page">
      {form.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {form.error.message || 'Failed to load leave policies.'}
        </Alert>
      )}
      {form.formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={form.dismissFormError}>
          {form.formError}
        </Alert>
      )}

      <Box sx={{ px: { xs: 0, sm: 0.5 }, py: 1 }}>
        {form.savedLocations.length === 0 ? (
          <LocationsRequiredEmpty />
        ) : form.listView ? (
          <LeaveTypesListView
            policyCount={form.policyCount}
            locationCount={form.savedLocations.length}
            searchQuery={form.searchQuery}
            onSearchChange={form.setSearchQuery}
            fields={form.fields}
            watchedLeaves={form.watchedLeaves}
            filteredDisplayIndices={form.filteredDisplayIndices}
            locationNameById={form.locationNameById}
            isDirty={form.isDirty}
            onAdd={canWrite ? form.startAddLeave : undefined}
            onRowClick={form.openEditor}
            onRemove={canWrite ? form.removeLeaveAt : undefined}
            readOnly={!canWrite}
          />
        ) : (
          <LeaveTypeEditorWizard
            idx={form.selectedIndex}
            row={form.selectedRow}
            wizardStep={form.wizardStep}
            isDirty={form.isDirty}
            isUpdating={form.isUpdating}
            register={form.register}
            control={form.control}
            errors={form.errors}
            savedLocations={form.savedLocations}
            onBackToList={() => form.setListView(true)}
            onWizardPrev={form.handleWizardPrev}
            onWizardNext={form.handleWizardNext}
            onCancel={form.handleCancel}
            onSubmit={handleWizardSubmit}
          />
        )}
      </Box>

      <AppSnackbar
        open={form.snackbar.open}
        message={form.snackbar.message}
        severity={form.snackbar.severity}
        onClose={form.closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        filled
        icon={<CheckCircleIcon fontSize="inherit" />}
      />
    </Box>
  );
}
