import { useForm, Controller } from 'react-hook-form';
import { useEmployeeSettings } from '../hooks/useEmployeeSettings';
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
  Divider,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ListIcon from '@mui/icons-material/List';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useEffect } from 'react';

// Constants for required fields dropdown
const REQUIRED_FIELD_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'department', label: 'Department' },
  { value: 'position', label: 'Position' },
  { value: 'hire_date', label: 'Hire Date' },
  { value: 'salary', label: 'Salary' },
  { value: 'address', label: 'Address' },
  { value: 'emergency_contact', label: 'Emergency Contact' },
];

// Validation function
const validateForm = (data) => {
  const errors = {};

  // Validate ID prefix
  if (data.id_prefix) {
    if (data.id_prefix.length > 10) {
      errors.id_prefix = 'ID prefix must be 10 characters or less';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(data.id_prefix)) {
      errors.id_prefix = 'ID prefix can only contain letters, numbers, hyphens, and underscores';
    }
  }

  // Validate probation period
  if (data.default_probation_period !== undefined && data.default_probation_period !== null) {
    if (data.default_probation_period < 1) {
      errors.default_probation_period = 'Probation period must be at least 1 day';
    }
    if (!Number.isInteger(data.default_probation_period)) {
      errors.default_probation_period = 'Probation period must be a whole number';
    }
  }

  return errors;
};

export function EmployeeSettingsForm({ accessToken, organizationId }) {
  const { settings, isLoading, error, updateSettings, isUpdating } = useEmployeeSettings(
    accessToken,
    organizationId
  );

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      id_prefix: 'EMP',
      auto_generate_id: true,
      required_fields: ['name', 'email'],
      default_probation_period: 90,
    },
  });

  // Watch required_fields for display
  const watchedRequiredFields = watch('required_fields');

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      reset({
        id_prefix: settings.id_prefix || 'EMP',
        auto_generate_id: settings.auto_generate_id !== undefined ? settings.auto_generate_id : true,
        required_fields: settings.required_fields || ['name', 'email'],
        default_probation_period: settings.default_probation_period || 90,
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
        // Set validation errors on form fields
        Object.entries(validationErrors).forEach(([field, message]) => {
          // This will be handled by form validation
        });
        setFormError(Object.values(validationErrors).join(', '));
        return;
      }

      // Call the update mutation
      await updateSettings(formData);

      setSuccessMessage('Employee settings updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to update employee settings. Please try again.');
      console.error('Failed to update employee settings:', err);
    }
  };

  // Handle reset
  const handleReset = () => {
    reset({
      id_prefix: settings.id_prefix || 'EMP',
      auto_generate_id: settings.auto_generate_id !== undefined ? settings.auto_generate_id : true,
      required_fields: settings.required_fields || ['name', 'email'],
      default_probation_period: settings.default_probation_period || 90,
    });
    setSuccessMessage('');
    setFormError('');
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
          {error.message || 'Failed to load employee settings. Please try again.'}
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
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Employee ID Settings Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Card Header */}
              <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <BadgeIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Employee ID Configuration
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Employee ID Prefix */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BadgeIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Employee ID Prefix
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        placeholder="EMP"
                        {...register('id_prefix', {
                          maxLength: {
                            value: 10,
                            message: 'ID prefix must be 10 characters or less'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_-]+$/,
                            message: 'Can only contain letters, numbers, hyphens, and underscores'
                          }
                        })}
                        error={!!errors.id_prefix}
                        helperText={errors.id_prefix?.message || 'Prefix for auto-generated employee IDs (max 10 chars)'}
                        size="medium"
                        inputProps={{ maxLength: 10 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Paper>
                  </Grid>

                  {/* Auto Generate ID */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AutoFixHighIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Auto Generate Employee ID
                        </Typography>
                      </Box>
                      <Controller
                        name="auto_generate_id"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                color="primary"
                              />
                            }
                            label={field.value ? 'Enabled' : 'Disabled'}
                            sx={{ ml: 0 }}
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Automatically generate employee IDs using the prefix
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Employee Fields Settings Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Card Header */}
              <Box sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <ListIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Required Fields & Probation
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Required Fields */}
                  <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ListIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Required Fields
                        </Typography>
                      </Box>
                      <Controller
                        name="required_fields"
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (!value || value.length === 0) {
                              return 'At least one required field must be selected';
                            }
                            return true;
                          }
                        }}
                        render={({ field, fieldState }) => (
                          <FormControl fullWidth error={!!fieldState.error}>
                            <InputLabel>Select required fields</InputLabel>
                            <Select
                              multiple
                              value={field.value || []}
                              onChange={(e) => field.onChange(e.target.value)}
                              label="Select required fields"
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip
                                      key={value}
                                      label={REQUIRED_FIELD_OPTIONS.find(opt => opt.value === value)?.label || value}
                                      size="small"
                                    />
                                  ))}
                                </Box>
                              )}
                              sx={{
                                borderRadius: 2,
                                minHeight: 56,
                              }}
                            >
                              {REQUIRED_FIELD_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {fieldState.error && (
                              <FormHelperText>{fieldState.error.message}</FormHelperText>
                            )}
                            {!fieldState.error && (
                              <FormHelperText>Select fields that must be filled for every employee</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Paper>
                  </Grid>

                  {/* Default Probation Period */}
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventNoteIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Default Probation Period
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="90"
                        {...register('default_probation_period', {
                          valueAsNumber: true,
                          validate: {
                            positive: (value) => value >= 1 || 'Must be at least 1 day',
                            integer: (value) => Number.isInteger(value) || 'Must be a whole number',
                          }
                        })}
                        error={!!errors.default_probation_period}
                        helperText={errors.default_probation_period?.message || 'In days'}
                        size="medium"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">days</InputAdornment>,
                          inputProps: { min: 1, step: 1 }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
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
                      }
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
