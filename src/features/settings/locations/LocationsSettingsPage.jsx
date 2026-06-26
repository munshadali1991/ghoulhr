import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { useLocationsSettingsForm } from './hooks/useLocationsSettingsForm';
import { LocationEditDialog } from './components/LocationEditDialog';
import { LocationsEmptyState } from './components/LocationsEmptyState';
import { LocationsLoadingSkeleton } from './components/LocationsLoadingSkeleton';
import { LocationsPageHeader } from './components/LocationsPageHeader';
import { LocationsSaveBar } from './components/LocationsSaveBar';
import { LocationsTable } from './components/LocationsTable';
import { useSettingsSectionAccess } from '@/features/settings/hooks/useSettingsSectionAccess';

/**
 * @param {{ organizationId: string }} props
 */
export function LocationsSettingsPage({ organizationId }) {
  const form = useLocationsSettingsForm(organizationId);
  const { canWrite } = useSettingsSectionAccess('locations');

  if (form.isLoading) {
    return <LocationsLoadingSkeleton />;
  }

  return (
    <Box>
      <FormStatusAlerts
        loadError={form.error}
        loadErrorMessage="Failed to load locations."
        formError={form.formError}
        onDismissFormError={form.dismissFormError}
        successMessage={form.successMessage}
      />

      <LocationsPageHeader locationCount={form.locationCount} />

      <form onSubmit={form.handleSubmit(form.onSubmit)}>
        <SettingsSection
          icon={<LocationOnIcon color="primary" />}
          title="Location directory"
          description="Table view stays compact at scale. Scroll inside the table to review many locations."
          actions={
            canWrite ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={form.openAddDialog}
                type="button"
              >
                Add location
              </Button>
            ) : null
          }
        >
          {form.fields.length === 0 ? (
            <LocationsEmptyState />
          ) : (
            <LocationsTable
              fields={form.fields}
              watchedLocations={form.watchedLocations}
              control={form.control}
              editingIndex={form.editingIndex}
              dialogOpen={form.dialogOpen}
              onEdit={canWrite ? form.openEditDialog : undefined}
              onRemove={canWrite ? form.remove : undefined}
            />
          )}
        </SettingsSection>

        <LocationEditDialog
          open={form.dialogOpen}
          onClose={form.closeDialog}
          editingIndex={form.editingIndex}
          isAddIntent={form.isAddIntent}
          register={form.register}
          control={form.control}
          errors={form.errors}
          remove={form.remove}
        />

        {canWrite ? (
          <LocationsSaveBar
            isDirty={form.isDirty}
            isUpdating={form.isUpdating}
            canSave={form.fields.length > 0}
          />
        ) : null}
      </form>
    </Box>
  );
}
