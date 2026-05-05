import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAttendanceSettings } from '../hooks/useAttendanceSettings';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsField } from '../components/settings/SettingsField';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
  Checkbox,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import { useState, useEffect, useRef } from 'react';

// Constants for weekdays
const WEEKDAYS = [
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
  { value: 'Sat', label: 'Saturday' },
  { value: 'Sun', label: 'Sunday' },
];

// Constants for tracking modes
const TRACKING_MODES = [
  { value: 'manual', label: 'Manual' },
  { value: 'biometric', label: 'Biometric' },
  { value: 'geo', label: 'Geo' },
  { value: 'ip', label: 'IP-based' },
];

// IP Address Input with Tags component
function IpAddressInput({ value = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleAddIp = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveIp = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIp();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter IP address (e.g., 192.168.1.1)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleAddIp} variant="outlined" startIcon={<AddIcon />}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {value.map((ip, index) => (
          <Chip
            key={index}
            label={ip}
            onDelete={() => handleRemoveIp(index)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
}

export function AttendanceSettingsForm({ organizationId }) {
  const { settings, isLoading, error, updateSettings, isUpdating } = useAttendanceSettings(
    organizationId
  );

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const hasInitialized = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors: formErrors, isDirty },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      shifts: [
        {
          name: 'Morning Shift',
          start_time: '09:00',
          end_time: '18:00',
          break_minutes: 60,
        },
      ],
      grace_period_minutes: 10,
      half_day_threshold_minutes: 240,
      overtime_enabled: false,
      overtime_rules: {},
      tracking_mode: 'manual',
      geo_fencing_enabled: false,
      allowed_ip_addresses: [],
    },
  });

  // Use useFieldArray for dynamic shifts
  const { fields: shiftFields, append: appendShift, remove: removeShift } = useFieldArray({
    control,
    name: 'shifts',
  });

  // Watch values for conditional rendering
  const overtimeEnabled = watch('overtime_enabled');
  const trackingMode = watch('tracking_mode');

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      reset({
        working_days: settings.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        shifts: settings.shifts || [
          {
            name: 'Morning Shift',
            start_time: '09:00',
            end_time: '18:00',
            break_minutes: 60,
          },
        ],
        grace_period_minutes: settings.grace_period_minutes ?? 10,
        half_day_threshold_minutes: settings.half_day_threshold_minutes ?? 240,
        overtime_enabled: settings.overtime_enabled ?? false,
        overtime_rules: settings.overtime_rules || {},
        tracking_mode: settings.tracking_mode || 'manual',
        geo_fencing_enabled: settings.geo_fencing_enabled ?? false,
        allowed_ip_addresses: settings.allowed_ip_addresses || [],
      });
    }
  }, [settings, reset]);

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      setSuccessMessage('');
      setFormError('');

      // Validate working days
      if (!formData.working_days || formData.working_days.length === 0) {
        setFormError('At least one working day must be selected');
        return;
      }

      // Validate shifts
      if (!formData.shifts || formData.shifts.length === 0) {
        setFormError('At least one shift must be added');
        return;
      }

      await updateSettings(formData);

      setSuccessMessage('Attendance settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to update attendance settings. Please try again.');
      console.error('Failed to update attendance settings:', err);
    }
  };

  // Handle reset
  const handleReset = () => {
    reset({
      working_days: settings.working_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      shifts: settings.shifts || [
        {
          name: 'Morning Shift',
          start_time: '09:00',
          end_time: '18:00',
          break_minutes: 60,
        },
      ],
      grace_period_minutes: settings.grace_period_minutes ?? 10,
      half_day_threshold_minutes: settings.half_day_threshold_minutes ?? 240,
      overtime_enabled: settings.overtime_enabled ?? false,
      overtime_rules: settings.overtime_rules || {},
      tracking_mode: settings.tracking_mode || 'manual',
      geo_fencing_enabled: settings.geo_fencing_enabled ?? false,
      allowed_ip_addresses: settings.allowed_ip_addresses || [],
    });
    setSuccessMessage('');
    setFormError('');
  };

  // Handle add new shift
  const handleAddShift = () => {
    appendShift({
      name: '',
      start_time: '',
      end_time: '',
      break_minutes: 0,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load attendance settings. Please try again.'}
        </Alert>
      )}

      {/* Form Error Alert */}
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon fontSize="inherit" />}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Working Days */}
        <SettingsSection
          icon={<EventAvailableIcon color="primary" />}
          title="Working Days"
          description="Select the days your organization operates"
        >
          <Controller
            name="working_days"
            control={control}
            rules={{
              validate: (value) => {
                if (!value || value.length === 0) {
                  return 'At least one working day must be selected';
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {WEEKDAYS.map((day) => (
                    <Chip
                      key={day.value}
                      label={day.label}
                      onClick={() => {
                        const currentDays = field.value || [];
                        const newDays = currentDays.includes(day.value)
                          ? currentDays.filter((d) => d !== day.value)
                          : [...currentDays, day.value];
                        field.onChange(newDays);
                      }}
                      color={field.value?.includes(day.value) ? 'primary' : 'default'}
                      variant={field.value?.includes(day.value) ? 'filled' : 'outlined'}
                      sx={{ minWidth: 100 }}
                    />
                  ))}
                </Box>
                {fieldState.error && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </SettingsSection>

        {/* Shift Management */}
        <SettingsSection
          icon={<AccessTimeIcon color="primary" />}
          title="Shift Management"
          description="Configure work shifts with start/end times and breaks"
        >
          <Grid container spacing={2}>
            {shiftFields.map((field, index) => (
              <Grid item xs={12} key={field.id}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Shift {index + 1}
                    </Typography>
                    {shiftFields.length > 1 && (
                      <IconButton
                        onClick={() => removeShift(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Shift Name"
                        {...register(`shifts.${index}.name`, {
                          required: 'Shift name is required',
                        })}
                        error={!!formErrors.shifts?.[index]?.name}
                        helperText={formErrors.shifts?.[index]?.name?.message}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        {...register(`shifts.${index}.start_time`, {
                          required: 'Start time is required',
                        })}
                        error={!!formErrors.shifts?.[index]?.start_time}
                        helperText={formErrors.shifts?.[index]?.start_time?.message}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        {...register(`shifts.${index}.end_time`, {
                          required: 'End time is required',
                        })}
                        error={!!formErrors.shifts?.[index]?.end_time}
                        helperText={formErrors.shifts?.[index]?.end_time?.message}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Break (minutes)"
                        type="number"
                        {...register(`shifts.${index}.break_minutes`, {
                          valueAsNumber: true,
                          min: { value: 0, message: 'Must be >= 0' },
                        })}
                        error={!!formErrors.shifts?.[index]?.break_minutes}
                        helperText={formErrors.shifts?.[index]?.break_minutes?.message}
                        size="small"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">min</InputAdornment>,
                          inputProps: { min: 0, step: 1 },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddShift}
                fullWidth
              >
                Add New Shift
              </Button>
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Time Rules */}
        <SettingsSection
          icon={<TimerIcon color="primary" />}
          title="Time Rules"
          description="Configure grace periods and attendance thresholds"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SettingsField
                label="Grace Period"
                error={formErrors.grace_period_minutes?.message}
                description="Late check-in grace period in minutes"
              >
                <TextField
                  fullWidth
                  type="number"
                  {...register('grace_period_minutes', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be >= 0' },
                  })}
                  error={!!formErrors.grace_period_minutes}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                    inputProps: { min: 0, step: 1 },
                  }}
                />
              </SettingsField>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingsField
                label="Half-Day Threshold"
                error={formErrors.half_day_threshold_minutes?.message}
                description="Minutes worked before marking as half-day"
              >
                <TextField
                  fullWidth
                  type="number"
                  {...register('half_day_threshold_minutes', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be >= 0' },
                  })}
                  error={!!formErrors.half_day_threshold_minutes}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                    inputProps: { min: 0, step: 1 },
                  }}
                />
              </SettingsField>
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Overtime Settings */}
        <SettingsSection
          icon={<EmojiEventsIcon color="primary" />}
          title="Overtime Settings"
          description="Configure overtime rules and policies"
        >
          <Controller
            name="overtime_enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                label={field.value ? 'Overtime Enabled' : 'Overtime Disabled'}
                sx={{ mb: 2 }}
              />
            )}
          />

          {overtimeEnabled && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Hours Per Day"
                    type="number"
                    {...register('overtime_rules.max_hours_per_day', { valueAsNumber: true })}
                    size="small"
                    InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Overtime Multiplier"
                    type="number"
                    {...register('overtime_rules.multiplier', { valueAsNumber: true })}
                    size="small"
                    InputProps={{ inputProps: { min: 1, step: 0.1 } }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </SettingsSection>

        {/* Attendance Mode */}
        <SettingsSection
          icon={<LanguageIcon color="primary" />}
          title="Attendance Mode"
          description="Choose how employees check in and out"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SettingsField
                label="Tracking Mode"
                description="Method used for attendance tracking"
              >
                <Controller
                  name="tracking_mode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      size="medium"
                    >
                      {TRACKING_MODES.map((mode) => (
                        <MenuItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </SettingsField>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingsField
                label="Geo-Fencing"
                description="Enable location-based attendance tracking"
              >
                <Controller
                  name="geo_fencing_enabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                      label={field.value ? 'Enabled' : 'Disabled'}
                    />
                  )}
                />
              </SettingsField>
            </Grid>
          </Grid>
        </SettingsSection>

        {/* IP Addresses (Conditional) */}
        {trackingMode === 'ip' && (
          <SettingsSection
            icon={<SecurityIcon color="primary" />}
            title="Allowed IP Addresses"
            description="Restrict attendance check-in to specific IP addresses"
          >
            <Controller
              name="allowed_ip_addresses"
              control={control}
              render={({ field }) => <IpAddressInput value={field.value || []} onChange={field.onChange} />}
            />
          </SettingsSection>
        )}

        {/* Action Buttons */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isDirty ? 'Unsaved changes detected' : 'No unsaved changes'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isUpdating || !isDirty}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isUpdating || !isDirty}
              >
                {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </form>
    </Box>
  );
}
