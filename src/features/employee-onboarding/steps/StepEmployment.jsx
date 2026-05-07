import { Autocomplete, Box, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import {
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../constants';
import { EmployeeAutocomplete } from '../components/EmployeeAutocomplete';

export function StepEmployment({ managerOptions, employeeSettings }) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedDepartment = useWatch({ control, name: 'employment.department' });
  const selectedDesignation = useWatch({ control, name: 'employment.designation' });

  const activeDepartments = useMemo(
    () =>
      (employeeSettings?.departments || [])
        .filter((d) => d?.isActive && d?.name)
        .map((d) => ({ id: d.id, label: d.name })),
    [employeeSettings?.departments],
  );

  const activeDesignations = useMemo(
    () => (employeeSettings?.designations || []).filter((d) => d?.isActive && d?.name),
    [employeeSettings?.designations],
  );

  const filteredDesignations = useMemo(() => {
    if (!selectedDepartment) return [];
    const department = activeDepartments.find(
      (d) => d.label.trim().toLowerCase() === String(selectedDepartment).trim().toLowerCase(),
    );
    if (!department) return [];
    return activeDesignations
      .filter((d) => Array.isArray(d.departmentIds) && d.departmentIds.includes(department.id))
      .map((d) => d.name);
  }, [activeDepartments, activeDesignations, selectedDepartment]);

  useEffect(() => {
    if (!selectedDesignation) return;
    if (filteredDesignations.length === 0 || !filteredDesignations.includes(selectedDesignation)) {
      setValue('employment.designation', '');
    }
  }, [filteredDesignations, selectedDesignation, setValue]);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 2
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Employment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Job structure, reporting lines, and official login email.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.dateOfJoining"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                type="date"
                label="Date of joining"
                InputLabelProps={{ shrink: true }}
                error={!!errors.employment?.dateOfJoining}
                helperText={errors.employment?.dateOfJoining?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Employee ID
          </Typography>
          <TextField fullWidth disabled value="Auto-generated on save" size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.employmentType"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Employment type">
                {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.employmentStatus"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Employment status">
                {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.officialEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                label="Official email login"
                placeholder="Leave blank to use personal email for login"
                error={!!errors.employment?.officialEmail}
                helperText={errors.employment?.officialEmail?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.department"
            control={control}
            render={({ field }) => (
              <Autocomplete
                freeSolo
                options={activeDepartments.map((d) => d.label)}
                value={field.value || ''}
                onInputChange={(_, v) => field.onChange(v)}
                onChange={(_, v) => field.onChange(v || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    required
                    error={!!errors.employment?.department}
                    helperText={errors.employment?.department?.message}
                  />
                )}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.designation"
            control={control}
            render={({ field }) => (
              <Autocomplete
                freeSolo={filteredDesignations.length === 0}
                options={filteredDesignations}
                value={field.value || ''}
                onInputChange={(_, v) => field.onChange(v)}
                onChange={(_, v) => field.onChange(v || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Designation"
                    required
                    disabled={!selectedDepartment}
                    error={!!errors.employment?.designation}
                    helperText={
                      errors.employment?.designation?.message ||
                      (!selectedDepartment ? 'Select department first' : '')
                    }
                  />
                )}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete
            name="employment.reportingManagerId"
            label="Reporting manager"
            options={managerOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete name="employment.hrManagerId" label="HR manager" options={managerOptions} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.workMode"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Work mode">
                {WORK_MODE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.shift"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Shift" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Controller
            name="employment.probationPeriodDays"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Probation (days)" inputProps={{ min: 0 }} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Controller
            name="employment.noticePeriodDays"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Notice period (days)" inputProps={{ min: 0 }} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="employment.businessUnit"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Business unit" />}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
