import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RecordFormLayout } from '@/features/settings/shared';
import { designationFormSchema } from '../schemas';
import { departmentNameMap } from '../utils/orgStructure';

export function DesignationFormPage({
  record,
  departments,
  isSaving,
  actionError,
  onClearActionError,
  onBack,
  onSave,
}) {
  const isEdit = Boolean(record?.id);
  const deptNames = departmentNameMap(departments);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: record
      ? {
          name: record.name || '',
          departmentIds: record.departmentIds || [],
          isActive: record.isActive !== false,
        }
      : {
          name: '',
          departmentIds: departments[0]?.id ? [departments[0].id] : [],
          isActive: true,
        },
    resolver: zodResolver(designationFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        {
          name: values.name,
          departmentIds: values.departmentIds,
          isActive: values.isActive,
          createdAt: record?.createdAt ?? null,
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
        { label: 'Designations', onClick: onBack },
        { label: isEdit ? 'Edit' : 'New' },
      ]}
      title={isEdit ? 'Edit designation' : 'Add designation'}
      subtitle="Designations are job titles employees can hold within one or more departments."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create designation'}
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Designation name" required error={errors.name?.message}>
            <TextField
              fullWidth
              size="medium"
              placeholder="e.g. Senior Software Engineer"
              {...register('name')}
              error={!!errors.name}
              autoFocus
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name="departmentIds"
            control={control}
            render={({ field }) => (
              <SettingsField label="Departments" required error={errors.departmentIds?.message}>
                <FormControl fullWidth error={!!errors.departmentIds} size="medium">
                  <InputLabel id="designation-dept-label">Departments</InputLabel>
                  <Select
                    labelId="designation-dept-label"
                    multiple
                    value={field.value || []}
                    label="Departments"
                    onChange={(e) => field.onChange(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => (
                          <Chip key={id} size="small" label={deptNames.get(id) || 'Department'} />
                        ))}
                      </Box>
                    )}
                  >
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.departmentIds ? (
                    <FormHelperText error>{errors.departmentIds.message}</FormHelperText>
                  ) : (
                    <FormHelperText>
                      Select every department where employees can hold this title.
                    </FormHelperText>
                  )}
                </FormControl>
              </SettingsField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <SettingsField
                label="Status"
                description="Inactive designations cannot be assigned to new employees."
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
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
