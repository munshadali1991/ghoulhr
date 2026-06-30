import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { Controller } from 'react-hook-form';
import { PageCard } from '@/shared/components/ui/PageCard';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import {
  ORG_CURRENCIES,
  ORG_DATE_FORMATS,
  ORG_FY_START_MONTHS,
  ORG_LANGUAGES,
  ORG_TIMEZONES,
} from '@/features/settings/shell/organizationSettings';
import { formatFinancialYearDetailed } from '../utils/organizationFyUtils';

/**
 * @param {{
 *   control: import('react-hook-form').Control<Record<string, string>>,
 *   errors: import('react-hook-form').FieldErrors<Record<string, string>>,
 *   financialYearStartMonth?: string,
 *   readOnly?: boolean,
 * }} props
 */
export function OrganizationRegionalSection({
  control,
  errors,
  financialYearStartMonth = '4',
  readOnly = false,
}) {
  const fyPreview = formatFinancialYearDetailed(financialYearStartMonth);
  const readOnlyFieldProps = readOnly ? { disabled: true } : {};

  const renderSelectField = (name, label, required, description, options, renderOption) => (
    <Controller
      name={name}
      control={control}
      rules={readOnly ? undefined : { required: `${label} is required` }}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          fullWidth
          select
          error={!!errors[name]}
          size="medium"
          {...readOnlyFieldProps}
        >
          {options.map((opt) => renderOption(opt))}
        </TextField>
      )}
    />
  );

  return (
    <PageCard sx={{ height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: 'background.default',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LanguageIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Regional & formats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Timezone, currency, and localization for your organization
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SettingsField
              label="Timezone"
              required={!readOnly}
              error={errors.timezone?.message}
              description="Primary timezone for schedules and reports"
            >
              {renderSelectField(
                'timezone',
                'Timezone',
                true,
                '',
                ORG_TIMEZONES,
                (timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone.replace(/_/g, ' ')}
                  </MenuItem>
                ),
              )}
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SettingsField
              label="Language"
              required={!readOnly}
              error={errors.language?.message}
              description="Interface language for the application"
            >
              {renderSelectField('language', 'Language', true, '', ORG_LANGUAGES, (lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SettingsField
              label="Currency"
              required={!readOnly}
              error={errors.currency?.message}
              description="Default currency for salary processing"
            >
              {renderSelectField('currency', 'Currency', true, '', ORG_CURRENCIES, (currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SettingsField
              label="Date format"
              required={!readOnly}
              error={errors.dateFormat?.message}
              description="How dates appear throughout the system"
            >
              {renderSelectField('dateFormat', 'Date format', true, '', ORG_DATE_FORMATS, (format) => (
                <MenuItem key={format} value={format}>
                  {format}
                </MenuItem>
              ))}
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SettingsField
              label="Financial year starts in"
              required={!readOnly}
              error={errors.financialYearStartMonth?.message}
              description="Used for reports, leave accrual, and payroll periods"
            >
              {renderSelectField(
                'financialYearStartMonth',
                'Financial year start month',
                true,
                '',
                ORG_FY_START_MONTHS,
                (month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ),
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Current financial year: {fyPreview}
              </Typography>
            </SettingsField>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
}
