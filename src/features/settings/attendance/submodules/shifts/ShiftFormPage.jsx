import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RhfDesktopTimePicker } from '@/shared/components/forms/RhfDesktopTimePicker';
import { RecordFormLayout } from '@/features/settings/shared';
import { dayjsToShiftTime, shiftTimeToDayjs } from '@/shared/utils/shiftTime';
import { shiftFormSchema } from '../../schemas';
import {
  defaultShiftTemplate,
  loadAttendanceClockFormat,
  netWorkingMinutes,
  formatDurationHuman,
  saveAttendanceClockFormat,
  parseTimeToMinutes,
} from '../../utils/shifts';
import { shiftBarGradient } from '@/shared/theme/surfaces';

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

function SessionTimePicker({ label, value, onChange, clockFormat }) {
  const is12 = clockFormat === '12';
  return (
    <DesktopTimePicker
      label={label}
      ampm={is12}
      format={is12 ? 'hh:mm A' : 'HH:mm'}
      value={shiftTimeToDayjs(value)}
      onChange={(v) => onChange(dayjsToShiftTime(v))}
      minutesStep={1}
      slotProps={{
        textField: {
          size: 'small',
          sx: { width: 150 },
          placeholder: is12 ? '9:00 AM' : '14:30',
        },
        openPickerButton: {
          'aria-label': `Open time picker: ${label}`,
        },
      }}
    />
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
  const [sessions, setSessions] = useState(
    () =>
      (Array.isArray(record?.sessions) ? record.sessions : []).map((s, i) => ({
        sessionLabel: s.sessionLabel || `Session ${i + 1}`,
        start_time: s.start_time || '',
        end_time: s.end_time || '',
      })),
  );

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
        isActive: record.isActive !== false,
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
  const startMinutes = parseTimeToMinutes(watched.start_time);
  const endMinutes = parseTimeToMinutes(watched.end_time);
  const isOvernight =
    startMinutes != null && endMinutes != null && endMinutes <= startMinutes;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave(
        {
          name: values.name,
          start_time: values.start_time,
          end_time: values.end_time,
          break_minutes: values.break_minutes,
          locationId: values.locationId,
          isActive: values.isActive !== false,
          sessions,
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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Working hours
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

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Schedule preview
          </Typography>
          <DayWindowBar start={watched.start_time} end={watched.end_time} theme={theme} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {netLabel
              ? `${netLabel} net working time${isOvernight ? ' · Overnight shift' : ''}`
              : 'Set start and end times to see net working time'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <SettingsField label="Status">
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value !== false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={field.value !== false ? 'Active' : 'Inactive'}
                />
              </SettingsField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Session windows (optional)
            </Typography>
            <Button
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                setSessions((prev) => [
                  ...prev,
                  {
                    sessionLabel: `Session ${prev.length + 1}`,
                    start_time: '',
                    end_time: '',
                  },
                ])
              }
            >
              Add session
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Split the shift into sessions for attendance tracking. If empty, the full shift counts as one session.
          </Typography>
          {sessions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No sessions defined — employees use the full shift window.
            </Typography>
          ) : (
            sessions.map((sess, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'flex-start',
                  mb: 2,
                  pb: 2,
                  borderBottom: idx < sessions.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <TextField
                  size="small"
                  label="Label"
                  value={sess.sessionLabel}
                  onChange={(e) =>
                    setSessions((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, sessionLabel: e.target.value } : s,
                      ),
                    )
                  }
                  sx={{ minWidth: 140 }}
                />
                <SessionTimePicker
                  label="Start"
                  value={sess.start_time}
                  clockFormat={clockFormat}
                  onChange={(next) =>
                    setSessions((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, start_time: next } : s)),
                    )
                  }
                />
                <SessionTimePicker
                  label="End"
                  value={sess.end_time}
                  clockFormat={clockFormat}
                  onChange={(next) =>
                    setSessions((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, end_time: next } : s)),
                    )
                  }
                />
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove session"
                  onClick={() => setSessions((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
        </Grid>
      </Grid>
    </RecordFormLayout>
  );
}
