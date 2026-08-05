import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import { Controller } from 'react-hook-form';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { ID_PREFIX_PATTERN } from '../constants';

/**
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<Record<string, unknown>>,
 *   control: import('react-hook-form').Control<Record<string, unknown>>,
 *   errors: import('react-hook-form').FieldErrors<Record<string, unknown>>,
 * }} props
 */
export function EmployeeIdConfigSection({ register, control, errors, readOnly = false }) {
  return (
    <SettingsSection
      icon={<BadgeIcon color="primary" />}
      title="Employee ID Configuration"
      description="Configure how employee IDs are generated and formatted"
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsField
            label="Employee ID Prefix"
            error={errors.id_prefix?.message}
            description="Prefix for auto-generated employee IDs (max 10 characters)"
          >
            <TextField
              fullWidth
              placeholder="EMP"
              disabled={readOnly}
              {...register('id_prefix', {
                maxLength: {
                  value: 10,
                  message: 'ID prefix must be 10 characters or less',
                },
                pattern: {
                  value: ID_PREFIX_PATTERN,
                  message: 'Can only contain letters, numbers, hyphens, and underscores',
                },
              })}
              error={!!errors.id_prefix}
              inputProps={{ maxLength: 10 }}
            />
          </SettingsField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
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
                      disabled={readOnly}
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
  );
}
