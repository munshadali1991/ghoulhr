import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
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
  IconButton,
  Skeleton,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ListIcon from '@mui/icons-material/List';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
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

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && UUID_V4_REGEX.test(value.trim());
}

function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last-resort deterministic-like fallback. Keeps app functional in old environments.
  const ts = Date.now().toString(16).padStart(12, '0');
  const rand = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(16)
    .padStart(20, '0')
    .slice(0, 20);
  const raw = `${rand}${ts}`.slice(0, 32);
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-4${raw.slice(13, 16)}-a${raw.slice(17, 20)}-${raw.slice(20, 32)}`;
}

function sanitizeMasterData(rawDepartments, rawDesignations) {
  const departmentsInput = Array.isArray(rawDepartments) ? rawDepartments : [];
  const designationsInput = Array.isArray(rawDesignations) ? rawDesignations : [];

  const idMap = new Map();
  const departments = departmentsInput.map((department) => {
    const originalId = typeof department?.id === 'string' ? department.id : '';
    const nextId = isUuid(originalId) ? originalId : generateUuid();
    if (originalId) {
      idMap.set(originalId, nextId);
    }
    return {
      id: nextId,
      name: typeof department?.name === 'string' ? department.name : '',
      code: typeof department?.code === 'string' ? department.code : '',
      isActive: department?.isActive !== false,
    };
  });

  const activeDepartmentIds = new Set(departments.map((department) => department.id));
  const designations = designationsInput.map((designation) => {
    const originalId = typeof designation?.id === 'string' ? designation.id : '';
    const nextId = isUuid(originalId) ? originalId : generateUuid();
    const rawIds = Array.isArray(designation?.departmentIds) ? designation.departmentIds : [];
    const mappedIds = rawIds
      .map((id) => (typeof id === 'string' ? id : ''))
      .map((id) => idMap.get(id) || id)
      .filter((id) => isUuid(id) && activeDepartmentIds.has(id));
    return {
      id: nextId,
      name: typeof designation?.name === 'string' ? designation.name : '',
      departmentIds: [...new Set(mappedIds)],
      isActive: designation?.isActive !== false,
    };
  });

  return { departments, designations };
}

export function EmployeeSettingsForm({
  organizationId,
  showCoreSettings = true,
  showMasterData = true,
}) {
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
    getValues,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      id_prefix: 'EMP',
      auto_generate_id: true,
      required_fields: ['name', 'email'],
      default_probation_period: 90,
      departments: [],
      designations: [],
    },
  });

  const departmentFieldArray = useFieldArray({
    control,
    name: 'departments',
  });
  const designationFieldArray = useFieldArray({
    control,
    name: 'designations',
  });
  const watchedDepartments = useWatch({ control, name: 'departments' }) || [];

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const sanitized = sanitizeMasterData(settings.departments, settings.designations);
      reset({
        id_prefix: settings.id_prefix || 'EMP',
        auto_generate_id: settings.auto_generate_id !== undefined ? settings.auto_generate_id : true,
        required_fields: settings.required_fields || ['name', 'email'],
        default_probation_period: settings.default_probation_period || 90,
        departments: sanitized.departments,
        designations: sanitized.designations,
      });
    }
  }, [settings, reset]);

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      setSuccessMessage('');
      setFormError('');

      const sanitized = sanitizeMasterData(formData.departments, formData.designations);
      const payload = {
        ...formData,
        departments: sanitized.departments,
        designations: sanitized.designations,
      };

      if (!validateMasterData(payload)) {
        setFormError('Please fix department/designation validation errors before saving.');
        return;
      }

      await updateSettings(payload);

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
      departments: sanitizeMasterData(settings.departments, settings.designations).departments,
      designations: sanitizeMasterData(settings.departments, settings.designations).designations,
    });
    setSuccessMessage('');
    setFormError('');
  };

  const validateMasterData = (values = getValues()) => {
    clearErrors();
    const departments = Array.isArray(values.departments) ? values.departments : [];
    const designations = Array.isArray(values.designations) ? values.designations : [];

    const departmentNames = new Set();
    for (let i = 0; i < departments.length; i += 1) {
      const name = departments[i]?.name?.trim();
      if (!name) {
        setError(`departments.${i}.name`, { type: 'manual', message: 'Department name is required' });
        return false;
      }
      const key = name.toLowerCase();
      if (departmentNames.has(key)) {
        setError(`departments.${i}.name`, { type: 'manual', message: 'Department name must be unique' });
        return false;
      }
      departmentNames.add(key);
    }

    const designationNames = new Set();
    for (let i = 0; i < designations.length; i += 1) {
      const name = designations[i]?.name?.trim();
      if (!name) {
        setError(`designations.${i}.name`, { type: 'manual', message: 'Designation name is required' });
        return false;
      }
      const key = name.toLowerCase();
      if (designationNames.has(key)) {
        setError(`designations.${i}.name`, { type: 'manual', message: 'Designation name must be unique' });
        return false;
      }
      designationNames.add(key);

      const ids = Array.isArray(designations[i]?.departmentIds) ? designations[i].departmentIds : [];
      if (ids.length === 0) {
        setError(`designations.${i}.departmentIds`, {
          type: 'manual',
          message: 'Map at least one department',
        });
        return false;
      }
    }

    return true;
  };

  const addDepartment = () => {
    departmentFieldArray.append({
      id: generateUuid(),
      name: '',
      code: '',
      isActive: true,
    });
  };

  const addDesignation = () => {
    designationFieldArray.append({
      id: generateUuid(),
      name: '',
      departmentIds: [],
      isActive: true,
    });
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
        {showCoreSettings && (
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
        )}

        {showCoreSettings && (
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
        )}

        {showMasterData && (
          <SettingsSection
            icon={<BadgeIcon color="primary" />}
            title="Department Master"
            description="Manage departments available in employee onboarding"
          >
          <Grid container spacing={2}>
            {departmentFieldArray.fields.map((field, index) => (
              <Grid item xs={12} key={field.id}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="Department Name"
                        {...register(`departments.${index}.name`)}
                        error={!!errors.departments?.[index]?.name}
                        helperText={errors.departments?.[index]?.name?.message}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Department Code"
                        {...register(`departments.${index}.code`)}
                      />
                    </Grid>
                    <Grid item xs={8} md={3}>
                      <Controller
                        name={`departments.${index}.isActive`}
                        control={control}
                        render={({ field: activeField }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!!activeField.value}
                                onChange={(e) => activeField.onChange(e.target.checked)}
                              />
                            }
                            label={activeField.value ? 'Active' : 'Inactive'}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4} md={1}>
                      <IconButton color="error" onClick={() => departmentFieldArray.remove(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addDepartment}>
                Add Department
              </Button>
            </Grid>
          </Grid>
          </SettingsSection>
        )}

        {showMasterData && (
          <SettingsSection
            icon={<AutoFixHighIcon color="primary" />}
            title="Designation Master"
            description="Manage designations and map them to departments"
          >
          <Grid container spacing={2}>
            {designationFieldArray.fields.map((field, index) => (
              <Grid item xs={12} key={field.id}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Designation Name"
                        {...register(`designations.${index}.name`)}
                        error={!!errors.designations?.[index]?.name}
                        helperText={errors.designations?.[index]?.name?.message}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Controller
                        name={`designations.${index}.departmentIds`}
                        control={control}
                        render={({ field: deptIdsField }) => (
                          <FormControl fullWidth error={!!errors.designations?.[index]?.departmentIds}>
                            <InputLabel>Mapped Departments</InputLabel>
                            <Select
                              multiple
                              value={deptIdsField.value || []}
                              onChange={(e) => deptIdsField.onChange(e.target.value)}
                              label="Mapped Departments"
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {selected.map((id) => {
                                    const dep = watchedDepartments.find((d) => d.id === id);
                                    return <Chip size="small" key={id} label={dep?.name || 'Unknown'} />;
                                  })}
                                </Box>
                              )}
                            >
                              {watchedDepartments.map((department, depIndex) => (
                                <MenuItem key={department.id || depIndex} value={department.id}>
                                  {department.name || `Department ${depIndex + 1}`}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              {errors.designations?.[index]?.departmentIds?.message}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={8} md={2}>
                      <Controller
                        name={`designations.${index}.isActive`}
                        control={control}
                        render={({ field: activeField }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!!activeField.value}
                                onChange={(e) => activeField.onChange(e.target.checked)}
                              />
                            }
                            label={activeField.value ? 'Active' : 'Inactive'}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4} md={1}>
                      <IconButton color="error" onClick={() => designationFieldArray.remove(index)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addDesignation}>
                Add Designation
              </Button>
            </Grid>
          </Grid>
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
