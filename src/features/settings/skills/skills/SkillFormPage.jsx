import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import { skillFormSchema } from '../schemas';

export function SkillFormPage({
  record,
  categories,
  subcategories,
  defaultCategoryId,
  defaultSubcategoryId,
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
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: record?.name || '',
      isActive: record?.isActive !== false,
      categoryId: record?.categoryId || defaultCategoryId || '',
      subcategoryId: record?.subcategoryId || defaultSubcategoryId || '',
    },
    resolver: zodResolver(skillFormSchema),
  });

  const selectedCategoryId = useWatch({ control, name: 'categoryId' });
  const filteredSubcategories = useMemo(
    () => subcategories.filter((row) => row.categoryId === selectedCategoryId),
    [subcategories, selectedCategoryId],
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        {
          name: values.name.trim(),
          subcategoryId: values.subcategoryId,
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
        { label: 'Skill list', onClick: onBack },
        { label: isEdit ? 'Edit' : 'New' },
      ]}
      title={isEdit ? 'Edit skill' : 'Add skill'}
      subtitle="Skills are the items employees select on their profile."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create skill'}
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
                  <InputLabel id="skill-form-category">Category</InputLabel>
                  <Select
                    {...field}
                    labelId="skill-form-category"
                    label="Category"
                    disabled={readOnly}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      setValue('subcategoryId', '');
                    }}
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
          <Controller
            name="subcategoryId"
            control={control}
            render={({ field }) => (
              <SettingsField label="Subcategory" required error={errors.subcategoryId?.message}>
                <FormControl fullWidth size="small" error={Boolean(errors.subcategoryId)}>
                  <InputLabel id="skill-form-subcategory">Subcategory</InputLabel>
                  <Select
                    {...field}
                    labelId="skill-form-subcategory"
                    label="Subcategory"
                    disabled={readOnly || !selectedCategoryId}
                  >
                    {filteredSubcategories.map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SettingsField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Skill name" required error={errors.name?.message}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. React"
              {...register('name')}
              error={Boolean(errors.name)}
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
                description="Inactive skills cannot be newly assigned by employees."
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
