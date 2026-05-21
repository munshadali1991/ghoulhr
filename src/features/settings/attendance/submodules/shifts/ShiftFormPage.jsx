import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RhfDesktopTimePicker } from '@/shared/components/forms/RhfDesktopTimePicker';
import { RecordFormLayout } from '@/features/settings/shared';
import { shiftFormSchema } from '../../schemas';
import {
  defaultShiftTemplate,
  loadAttendanceClockFormat,
  netWorkingMinutes,
  formatDurationHuman,
  saveAttendanceClockFormat,
} from '../../utils/shifts';
import { shiftBarGradient } from '@/shared/theme/surfaces';
import { shiftTimeRangeTooltip } from '@/shared/utils/shiftTime';

function DayWindowBar({ start, end, theme }) {
  const parse = (t) => {
    if (!t || typeof t !== 'string') return null;
    const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  };
  const s = parse(start);
  const e = parse(end);
  if (s == null || e == null) {
    return (
      <Box sx={{ height: 10, borderRadius: 1, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }} />
    );
  }
  let span = e - s;
  if (span <= 0) span += 24 * 60;
  const leftPct = (s / (24 * 60)) * 100;
  const widthPct = Math.min(100 - leftPct, Math.max((span / (24 * 60)) * 100, 0.9));
  return (
    <Box sx={{ position: 'relative', height: 10, borderRadius: 1, bgcolor: 'action.hover', border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          top: 0,
          bottom: 0,
          background: shiftBarGradient(theme),
        }}
      />
    </Box>
  );
}

export function ShiftFormPage({
  record,
  branchLocations,
  firstBranchId,
  isSaving,
  actionError,
  onClearActionError,
  onBack,
  onSave,
}) {
  const theme = useTheme();
  const isEdit = Boolean(record?.id);
  const [clockFormat, setClockFormat] = useState(loadAttendanceClockFormat);

  useEffect(() => {
    saveAttendanceClockFormat(clockFormat);
  }, [clockFormat]);

  const defaults = record
    ? {
        name: record.name || '',
        start_time: record.start_time || '',
        end_time: record.end_time || '',
        break_minutes: record.break_minutes ?? 0,
        locationId: record.locationId || '',
      }
    : defaultShiftTemplate(firstBranchId);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaults,
    resolver: zodResolver(shiftFormSchema),
  });

  const watched = watch();

  const netLabel = formatDurationHuman(
    netWorkingMinutes(watched.start_time, watched.end_time, watched.break_minutes),
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        {
          name: values.name,
          start_time: values.start_time,
          end_time: values.end_time,
          break_minutes: values.break_minutes,
          locationId: values.locationId,
          createdAt: record?.createdAt ?? null,
        },
        record?.id,
      );
      onBack();
    } catch {
      /* actionError */
    }
  });

  return (
    <RecordFormLayout
      breadcrumbs={[
        { label: 'Attendance', onClick: onBack },
        { label: 'Shifts', onClick: onBack },
        { label: isEdit ? 'Edit' : 'New' },
      ]}
      title={isEdit ? 'Edit shift' : 'Add shift'}
      subtitle="Shift templates define expected hours, breaks, and branch location for attendance."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel={isEdit ? 'Save changes' : 'Create shift'}
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      {branchLocations.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Add a branch under Settings → Locations before saving this shift.
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <SettingsField label="Shift name" required error={errors.name?.message}>
            <TextField
              fullWidth
              size="medium"
              placeholder="e.g. General — Morning (HQ)"
              {...register('name')}
              error={!!errors.name}
              autoFocus
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Schedule preview
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={clockFormat}
              onChange={(_, v) => v && setClockFormat(v)}
              aria-label="Clock format"
            >
              <ToggleButton value="12">12-hour</ToggleButton>
              <ToggleButton value="24">24-hour</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <DayWindowBar start={watched.start_time} end={watched.end_time} theme={theme} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {shiftTimeRangeTooltip(watched.start_time, watched.end_time) || 'Set start and end times'}
            {netLabel ? ` · ${netLabel} net working time` : ''}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <RhfDesktopTimePicker
            control={control}
            name="start_time"
            label="Start time"
            rules={{ required: 'Start time is required' }}
            clockFormat={clockFormat}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RhfDesktopTimePicker
            control={control}
            name="end_time"
            label="End time"
            rules={{ required: 'End time is required' }}
            clockFormat={clockFormat}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SettingsField label="Break" error={errors.break_minutes?.message}>
            <TextField
              fullWidth
              size="medium"
              type="number"
              {...register('break_minutes', { valueAsNumber: true })}
              error={!!errors.break_minutes}
              helperText="Unpaid / meal minutes deducted from shift"
              InputProps={{
                endAdornment: <InputAdornment position="end">min</InputAdornment>,
                inputProps: { min: 0, step: 1 },
              }}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="locationId"
            control={control}
            render={({ field, fieldState }) => (
              <SettingsField label="Branch / location" required error={fieldState.error?.message}>
                <FormControl fullWidth size="medium" error={!!fieldState.error}>
                  <InputLabel id="shift-branch-label">Branch</InputLabel>
                  <Select
                    labelId="shift-branch-label"
                    label="Branch"
                    value={field.value || ''}
                    onChange={field.onChange}
                    disabled={branchLocations.length === 0}
                  >
                    {branchLocations
                      .filter((loc) => loc.isActive !== false)
                      .map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                          {loc.name}
                          {loc.city ? ` — ${loc.city}` : ''}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              </SettingsField>
            )}
          />
        </Grid>
      </Grid>
    </RecordFormLayout>
  );
}
