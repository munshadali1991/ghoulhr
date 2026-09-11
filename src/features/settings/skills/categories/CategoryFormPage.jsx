import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RecordFormLayout } from '@/features/settings/shared';
import { skillNameFormSchema } from '../schemas';

const EMPTY_FORM = {
  name: '',
  isActive: true,
};

export function CategoryFormPage({
  record,
  isSaving,
  actionError,
  onClearActionError,
  onBack,
  onSave,
  readOnly = false,
}) {
  const isEdit = Boolean(record?.id);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: record
      ? { name: record.name || '', isActive: record.isActive !== false }
      : EMPTY_FORM,
    resolver: zodResolver(skillNameFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        { name: values.name.trim(), isActive: values.isActive },
        record?.id,
      );
      onBack();
    } catch {
      /* actionError set by hook */
    }
  });

  return (
    <RecordFormLayout
      breadcrumbs={[
        { label: 'Skills', onClick: onBack },
        { label: 'Categories', onClick: onBack },
        { label: isEdit ? 'Edit' : 'New' },
      ]}
      title={isEdit ? 'Edit category' : 'Add category'}
      subtitle="Categories are broad skill domains used to group the company catalog."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create category'}
      readOnly={readOnly}
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Category name" required error={errors.name?.message}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Software Development"
              {...register('name')}
              error={Boolean(errors.name)}
              autoFocus
              disabled={readOnly}
            />
          </SettingsField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <SettingsField
                label="Status"
                description="Inactive categories are hidden from employee skill pickers."
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                      disabled={readOnly}
                    />
                  }
                  label={field.value ? 'Active' : 'Inactive'}
                />
              </SettingsField>
            )}
          />
        </Grid>
      </Grid>
    </RecordFormLayout>
  );
}
