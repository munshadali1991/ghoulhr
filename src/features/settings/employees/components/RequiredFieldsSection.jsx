import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import { Controller } from 'react-hook-form';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { REQUIRED_FIELD_OPTIONS } from '../constants';
import { requiredFieldLabel } from '../utils/employeeSettingsMappers';

/**
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<Record<string, unknown>>,
 *   control: import('react-hook-form').Control<Record<string, unknown>>,
 *   errors: import('react-hook-form').FieldErrors<Record<string, unknown>>,
 * }} props
 */
export function RequiredFieldsSection({ register, control, errors, readOnly = false }) {
  return (
    <SettingsSection
      icon={<ListIcon color="primary" />}
      title="Required Fields & Probation"
      description="Configure mandatory employee fields and probation period"
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
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
                    disabled={readOnly}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={requiredFieldLabel(value)} size="small" />
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
                  {fieldState.error ? (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SettingsField
            label="Default Probation Period"
            error={errors.default_probation_period?.message}
            description="Standard probation period for new employees"
          >
            <TextField
              fullWidth
              type="number"
              placeholder="90"
              disabled={readOnly}
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
  );
}
