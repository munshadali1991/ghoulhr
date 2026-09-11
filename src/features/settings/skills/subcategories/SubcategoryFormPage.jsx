import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RecordFormLayout } from '@/features/settings/shared';
import { subcategoryFormSchema } from '../schemas';

export function SubcategoryFormPage({
  record,
  categories,
  defaultCategoryId,
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
    defaultValues: {
      name: record?.name || '',
      isActive: record?.isActive !== false,
      categoryId: record?.categoryId || defaultCategoryId || '',
    },
    resolver: zodResolver(subcategoryFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        {
          name: values.name.trim(),
          categoryId: values.categoryId,
          isActive: values.isActive,
        },
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
        { label: 'Subcategories', onClick: onBack },
        { label: isEdit ? 'Edit' : 'New' },
      ]}
      title={isEdit ? 'Edit subcategory' : 'Add subcategory'}
      subtitle="Subcategories sit under a category and hold the actual skills."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create subcategory'}
      readOnly={readOnly}
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <SettingsField label="Category" required error={errors.categoryId?.message}>
                <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>
                  <InputLabel id="subcategory-category">Category</InputLabel>
                  <Select
                    {...field}
                    labelId="subcategory-category"
                    label="Category"
                    disabled={readOnly}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SettingsField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Subcategory name" required error={errors.name?.message}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Frontend"
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
                description="Inactive subcategories are hidden from employee skill pickers."
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
