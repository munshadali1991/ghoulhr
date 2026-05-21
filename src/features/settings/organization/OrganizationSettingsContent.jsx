import { Box, Grid, MenuItem, TextField } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import {
  ORG_CURRENCIES,
  ORG_DATE_FORMATS,
  ORG_LANGUAGES,
  ORG_TIMEZONES,
} from '@/features/settings/shell/organizationSettings';
import { LogoUploadField } from './components/LogoUploadField';

/**
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<Record<string, string>>,
 *   errors: import('react-hook-form').FieldErrors<Record<string, string>>,
 *   logoPreview: string | null,
 *   onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
 * }} props
 */
export function OrganizationSettingsContent({ register, errors, logoPreview, onLogoUpload }) {
  return (
    <Box component="form" noValidate>
      <SettingsSection
        icon={<BusinessIcon color="primary" />}
        title="Organization Profile"
        description="Basic information about your organization"
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <LogoUploadField logoPreview={logoPreview} onUpload={onLogoUpload} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <SettingsField
              label="Organization Name"
              required
              error={errors.name?.message}
              description="This name will be displayed across your organization's dashboard and reports"
            >
              <TextField
                fullWidth
                placeholder="Enter organization name"
                {...register('name', { required: 'Organization name is required' })}
                error={!!errors.name}
                size="medium"
              />
            </SettingsField>
          </Grid>
        </Grid>
      </SettingsSection>

      <SettingsSection
        icon={<LanguageIcon color="primary" />}
        title="Regional Settings"
        description="Configure timezone, currency, and localization preferences"
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SettingsField
              label="Timezone"
              required
              error={errors.timezone?.message}
              description="Your organization's primary timezone"
            >
              <TextField
                fullWidth
                select
                {...register('timezone', { required: 'Timezone is required' })}
                error={!!errors.timezone}
                size="medium"
              >
                {ORG_TIMEZONES.map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SettingsField
              label="Currency"
              required
              error={errors.currency?.message}
              description="Default currency for salary processing"
            >
              <TextField
                fullWidth
                select
                {...register('currency', { required: 'Currency is required' })}
                error={!!errors.currency}
                size="medium"
              >
                {ORG_CURRENCIES.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SettingsField
              label="Date Format"
              required
              error={errors.dateFormat?.message}
              description="How dates will be displayed throughout the system"
            >
              <TextField
                fullWidth
                select
                {...register('dateFormat', { required: 'Date format is required' })}
                error={!!errors.dateFormat}
                size="medium"
              >
                {ORG_DATE_FORMATS.map((format) => (
                  <MenuItem key={format} value={format}>
                    {format}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SettingsField
              label="Language"
              required
              error={errors.language?.message}
              description="Interface language for the application"
            >
              <TextField
                fullWidth
                select
                {...register('language', { required: 'Language is required' })}
                error={!!errors.language}
                size="medium"
              >
                {ORG_LANGUAGES.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>
        </Grid>
      </SettingsSection>
    </Box>
  );
}
