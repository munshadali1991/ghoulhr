import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RecordFormLayout } from '@/features/settings/shared';
import { scheduleFormSchema } from '../../schemas';
import { WEEKDAYS } from '../../constants';

export function ScheduleFormPage({
  schedule,
  isSaving,
  actionError,
  onClearActionError,
  onBack,
  onSave,
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      working_days: schedule.working_days,
      grace_period_minutes: schedule.grace_period_minutes,
      half_day_threshold_minutes: schedule.half_day_threshold_minutes,
      overtime_enabled: schedule.overtime_enabled,
      overtime_rules: schedule.overtime_rules || {},
    },
    resolver: zodResolver(scheduleFormSchema),
  });

  const overtimeEnabled = watch('overtime_enabled');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave({
        working_days: values.working_days,
        grace_period_minutes: values.grace_period_minutes,
        half_day_threshold_minutes: values.half_day_threshold_minutes,
        overtime_enabled: values.overtime_enabled,
        overtime_rules: values.overtime_rules,
      });
      onBack();
    } catch {
      /* actionError */
    }
  });

  return (
    <RecordFormLayout
      breadcrumbs={[
        { label: 'Attendance', onClick: onBack },
        { label: 'Schedule & rules', onClick: onBack },
        { label: 'Edit' },
      ]}
      title="Edit schedule & rules"
      subtitle="Define the working week and how daily attendance is evaluated."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel="Save changes"
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Working week" required error={errors.working_days?.message}>
            <Controller
              name="working_days"
              control={control}
              render={({ field }) => (
                <TableContainer sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {WEEKDAYS.map((day) => (
                          <TableCell key={day.value} align="center" sx={{ fontWeight: 600, fontSize: 12 }}>
                            {day.short}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        {WEEKDAYS.map((day) => {
                          const selected = field.value?.includes(day.value);
                          return (
                            <TableCell key={day.value} align="center">
                              <Tooltip title={day.label}>
                                <Checkbox
                                  checked={!!selected}
                                  onChange={() => {
                                    const current = field.value || [];
                                    field.onChange(
                                      selected
                                        ? current.filter((d) => d !== day.value)
                                        : [...current, day.value],
                                    );
                                  }}
                                />
                              </Tooltip>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SettingsField label="Grace period" error={errors.grace_period_minutes?.message}>
            <TextField
              fullWidth
              size="medium"
              type="number"
              {...register('grace_period_minutes', { valueAsNumber: true })}
              helperText="Minutes after shift start before late is recorded"
              InputProps={{
                endAdornment: <InputAdornment position="end">min</InputAdornment>,
                inputProps: { min: 0 },
              }}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SettingsField label="Half-day threshold" error={errors.half_day_threshold_minutes?.message}>
            <TextField
              fullWidth
              size="medium"
              type="number"
              {...register('half_day_threshold_minutes', { valueAsNumber: true })}
              helperText="Minimum minutes worked to count as a half-day"
              InputProps={{
                endAdornment: <InputAdornment position="end">min</InputAdornment>,
                inputProps: { min: 0 },
              }}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name="overtime_enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Enable overtime
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Apply caps and multipliers for hours beyond scheduled shift.
                    </Typography>
                  </Box>
                }
              />
            )}
          />
        </Grid>

        {overtimeEnabled ? (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Max hours per day"
                type="number"
                {...register('overtime_rules.max_hours_per_day', { valueAsNumber: true })}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="medium"
                label="Overtime multiplier"
                type="number"
                {...register('overtime_rules.multiplier', { valueAsNumber: true })}
                helperText="Applied when calculating overtime pay"
                inputProps={{ min: 1, step: 0.1 }}
              />
            </Grid>
          </>
        ) : null}
      </Grid>
    </RecordFormLayout>
  );
}
