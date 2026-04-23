import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAttendanceSettings } from '../hooks/useAttendanceSettings';
import {
  Box,
  Card,
  CardContent,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import { useState, useEffect } from 'react';

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

// Validation function
const validateForm = (data) => {
  const errors = {};

  // Validate working days
  if (!data.working_days || data.working_days.length === 0) {
    errors.working_days = 'At least one working day must be selected';
  }

  // Validate shifts
  if (!data.shifts || data.shifts.length === 0) {
    errors.shifts = 'At least one shift must be added';
  } else {
    const shiftErrors = [];
    data.shifts.forEach((shift, index) => {
      if (!shift.name || shift.name.trim() === '') {
        shiftErrors.push(`Shift ${index + 1}: Name is required`);
      }
      if (!shift.start_time) {
        shiftErrors.push(`Shift ${index + 1}: Start time is required`);
      }
      if (!shift.end_time) {
        shiftErrors.push(`Shift ${index + 1}: End time is required`);
      }
      if (shift.start_time && shift.end_time) {
        if (shift.start_time >= shift.end_time) {
          shiftErrors.push(`Shift ${index + 1}: End time must be after start time`);
        }
      }
      if (shift.break_minutes !== undefined && shift.break_minutes !== null) {
        if (shift.break_minutes < 0) {
          shiftErrors.push(`Shift ${index + 1}: Break minutes must be >= 0`);
        }
      }
    });
    if (shiftErrors.length > 0) {
      errors.shifts = shiftErrors;
    }
  }

  // Validate grace period
  if (data.grace_period_minutes !== undefined && data.grace_period_minutes !== null) {
    if (data.grace_period_minutes < 0) {
      errors.grace_period_minutes = 'Grace period must be >= 0';
    }
  }

  // Validate half-day threshold
  if (data.half_day_threshold_minutes !== undefined && data.half_day_threshold_minutes !== null) {
    if (data.half_day_threshold_minutes < 0) {
      errors.half_day_threshold_minutes = 'Half-day threshold must be >= 0';
    }
  }

  // Validate IP addresses
  if (data.allowed_ip_addresses && data.allowed_ip_addresses.length > 0) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[12]?[0-9]))?$/;
    const invalidIps = data.allowed_ip_addresses.filter((ip) => !ipRegex.test(ip));
    if (invalidIps.length > 0) {
      errors.allowed_ip_addresses = `Invalid IP addresses: ${invalidIps.join(', ')}`;
    }
  }

  return errors;
};

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

export function AttendanceSettingsForm({ accessToken, organizationId }) {
  // Debug logging
  console.log('AttendanceSettingsForm props:', { accessToken: accessToken ? 'EXISTS' : 'MISSING', organizationId });
  
  const { settings, isLoading, error, updateSettings, isUpdating } = useAttendanceSettings(
    accessToken,
    organizationId
  );

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

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
    if (settings && Object.keys(settings).length > 0) {
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

      // Validate form data
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Array.isArray(validationErrors.shifts)
          ? validationErrors.shifts
          : Object.values(validationErrors);
        setFormError(errorMessages.join(', '));
        return;
      }

      // Call the update mutation
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
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
        <Grid container spacing={3}>
          {/* Working Days Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <EventAvailableIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Working Days
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
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
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Select working days</InputLabel>
                        <Select
                          multiple
                          value={field.value || []}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Select working days"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={WEEKDAYS.find((opt) => opt.value === value)?.label || value}
                                  size="small"
                                />
                              ))}
                            </Box>
                          )}
                          sx={{ borderRadius: 2, minHeight: 56 }}
                        >
                          {WEEKDAYS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                        {!fieldState.error && (
                          <FormHelperText>Select the days your organization operates</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Shift Management Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <AccessTimeIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Shift Management
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {shiftFields.map((field, index) => (
                    <Grid item xs={12} key={field.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Shift {index + 1}
                          </Typography>
                          {shiftFields.length > 1 && (
                            <IconButton
                              onClick={() => removeShift(index)}
                              color="error"
                              size="small"
                              sx={{
                                border: '1px solid',
                                borderColor: 'error.light',
                                '&:hover': {
                                  bgcolor: 'error.lighter',
                                },
                              }}
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
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                      sx={{ borderRadius: 2, py: 1.5 }}
                    >
                      Add New Shift
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Time Rules Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TimerIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Time Rules
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TimerIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Grace Period
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        label="Minutes"
                        {...register('grace_period_minutes', {
                          valueAsNumber: true,
                          min: { value: 0, message: 'Must be >= 0' },
                        })}
                        error={!!formErrors.grace_period_minutes}
                        helperText={formErrors.grace_period_minutes?.message || 'Late check-in grace period'}
                        size="medium"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">min</InputAdornment>,
                          inputProps: { min: 0, step: 1 },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TimerIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Half-Day Threshold
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        label="Minutes"
                        {...register('half_day_threshold_minutes', {
                          valueAsNumber: true,
                          min: { value: 0, message: 'Must be >= 0' },
                        })}
                        error={!!formErrors.half_day_threshold_minutes}
                        helperText={formErrors.half_day_threshold_minutes?.message || 'Minutes before marking half-day'}
                        size="medium"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">min</InputAdornment>,
                          inputProps: { min: 0, step: 1 },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Overtime Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <EmojiEventsIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Overtime Settings
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configure overtime rules (optional)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Max Hours Per Day"
                            type="number"
                            {...register('overtime_rules.max_hours_per_day', { valueAsNumber: true })}
                            size="small"
                            InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance Mode Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <LanguageIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Attendance Mode
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LanguageIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Tracking Mode
                        </Typography>
                      </Box>
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          >
                            {TRACKING_MODES.map((mode) => (
                              <MenuItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <GpsFixedIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Geo-Fencing
                        </Typography>
                      </Box>
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
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Enable location-based attendance tracking
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* IP Addresses Card */}
          {trackingMode === 'ip' && (
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                    Allowed IP Addresses
                  </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Controller
                      name="allowed_ip_addresses"
                      control={control}
                      render={({ field }) => <IpAddressInput value={field.value || []} onChange={field.onChange} />}
                    />
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {isDirty ? 'Unsaved changes detected' : 'No unsaved changes'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={isUpdating || !isDirty}
                    startIcon={<RestartAltIcon />}
                    size="large"
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={isUpdating || !isDirty}
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
