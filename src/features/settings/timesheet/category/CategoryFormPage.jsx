import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, FormControlLabel, Switch, TextField } from '@mui/material';
import { RecordFormLayout } from '@/features/settings/shared';
import { categoryFormSchema } from '../schemas/categorySchema';

const EMPTY_FORM = {
  name: '',
  isActive: true,
};

/**
 * @param {{
 *   record: object | null,
 *   isSaving: boolean,
 *   actionError: string,
 *   onClearActionError: () => void,
 *   onBack: () => void,
 *   onSave: (values: object, existingId?: string) => Promise<void>,
 * }} props
 */
export function CategoryFormPage({
  record,
  isSaving,
  actionError,
  onClearActionError,
  onBack,
  onSave,
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
    resolver: zodResolver(categoryFormSchema),
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
      title={isEdit ? 'Edit category' : 'Add category'}
      backLabel="Back to categories"
      onBack={onBack}
      onSubmit={onSubmit}
      isSaving={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create category'}
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <TextField
        label="Name"
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />}
            label="Active (shown in employee timesheet dropdown)"
          />
        )}
      />
    </RecordFormLayout>
  );
}
