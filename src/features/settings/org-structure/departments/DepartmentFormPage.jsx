import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RecordFormLayout } from '@/features/settings/shared';
import { departmentFormSchema } from '../schemas';

const EMPTY_FORM = {
  name: '',
  code: '',
  isActive: true,
};

export function DepartmentFormPage({
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
      ? {
          name: record.name || '',
          code: record.code || '',
          isActive: record.isActive !== false,
        }
      : EMPTY_FORM,
    resolver: zodResolver(departmentFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        {
          name: values.name,
          code: values.code,
          isActive: values.isActive,
        },
        record?.id,
      );
      onBack();
    } catch {
      /* actionError handled by parent */
    }
  });

  return (
    <RecordFormLayout
      breadcrumbs={[
        { label: 'Organization structure', onClick: onBack },
        { label: 'Departments', onClick: onBack },
        { label: isEdit ? 'Edit' : 'New' },
      ]}
      title={isEdit ? 'Edit department' : 'Add department'}
      subtitle="Departments organize teams and link employees to designations."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create department'}
      readOnly={readOnly}
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Department name" required error={errors.name?.message}>
            <TextField
              fullWidth
              size="medium"
              placeholder="e.g. Engineering"
              {...register('name')}
              error={!!errors.name}
              autoFocus
              disabled={readOnly}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SettingsField
            label="Description"
            error={errors.code?.message}
            description="Optional short label shown in lists and employee profiles."
          >
            <TextField
              fullWidth
              size="medium"
              multiline
              minRows={3}
              placeholder="What does this department do?"
              {...register('code')}
              error={!!errors.code}
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
                description="Inactive departments are hidden from new assignments but kept in history."
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
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
