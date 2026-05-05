import { useForm, Controller } from 'react-hook-form';
import { useEmployeeSettings } from '../hooks/useEmployeeSettings';
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
  Skeleton,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ListIcon from '@mui/icons-material/List';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useEffect, useRef } from 'react';

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

export function EmployeeSettingsForm({ organizationId }) {
  const { settings, isLoading, error, updateSettings, isUpdating } = useEmployeeSettings(
    organizationId
  );

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const hasInitialized = useRef(false);

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

  const watchedRequiredFields = watch('required_fields');

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
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

      await updateSettings(formData);

      setSuccessMessage('Employee settings updated successfully!');
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
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
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
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon fontSize="inherit" />}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Employee ID Configuration */}
        <SettingsSection
          icon={<BadgeIcon color="primary" />}
          title="Employee ID Configuration"
          description="Configure how employee IDs are generated and formatted"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SettingsField
                label="Employee ID Prefix"
                error={errors.id_prefix?.message}
                description="Prefix for auto-generated employee IDs (max 10 characters)"
              >
                <TextField
                  fullWidth
                  placeholder="EMP"
                  {...register('id_prefix', {
                    maxLength: {
                      value: 10,
                      message: 'ID prefix must be 10 characters or less',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Can only contain letters, numbers, hyphens, and underscores',
                    },
                  })}
                  error={!!errors.id_prefix}
                  inputProps={{ maxLength: 10 }}
                />
              </SettingsField>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingsField
                label="Auto Generate Employee ID"
                description="Automatically generate employee IDs using the prefix"
              >
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
                    />
                  )}
                />
              </SettingsField>
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Required Fields & Probation */}
        <SettingsSection
          icon={<ListIcon color="primary" />}
          title="Required Fields & Probation"
          description="Configure mandatory employee fields and probation period"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <SettingsField
                label="Required Fields"
                error={errors.required_fields?.message}
                description="Select fields that must be filled for every employee"
              >
                <Controller
                  name="required_fields"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || value.length === 0) {
                        return 'At least one required field must be selected';
                      }
                      return true;
                    },
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
                                label={REQUIRED_FIELD_OPTIONS.find((opt) => opt.value === value)?.label || value}
                                size="small"
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {REQUIRED_FIELD_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </SettingsField>
            </Grid>

            <Grid item xs={12} md={4}>
              <SettingsField
                label="Default Probation Period"
                error={errors.default_probation_period?.message}
                description="Standard probation period for new employees"
              >
                <TextField
                  fullWidth
                  type="number"
                  placeholder="90"
                  {...register('default_probation_period', {
                    valueAsNumber: true,
                    validate: {
                      positive: (value) => value >= 1 || 'Must be at least 1 day',
                      integer: (value) => Number.isInteger(value) || 'Must be a whole number',
                    },
                  })}
                  error={!!errors.default_probation_period}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                    inputProps: { min: 1, step: 1 },
                  }}
                />
              </SettingsField>
            </Grid>
          </Grid>
        </SettingsSection>

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
