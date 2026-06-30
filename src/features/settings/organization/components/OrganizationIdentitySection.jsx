import { Box, Grid, TextField, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { PageCard } from '@/shared/components/ui/PageCard';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { LogoUploadField } from './LogoUploadField';
import { OrganizationIdentityReadOnly } from './OrganizationProfileSkeleton';

/**
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<Record<string, string>>,
 *   errors: import('react-hook-form').FieldErrors<Record<string, string>>,
 *   logoPreview: string | null,
 *   onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *   readOnly?: boolean,
 *   organizationName?: string,
 * }} props
 */
export function OrganizationIdentitySection({
  register,
  errors,
  logoPreview,
  onLogoUpload,
  readOnly = false,
  organizationName = '',
}) {
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
            <BusinessIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Company identity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logo and name shown in the sidebar and header across your workspace.
            </Typography>
          </Box>
        </Box>

        {readOnly ? (
          <OrganizationIdentityReadOnly logoPreview={logoPreview} name={organizationName} />
        ) : (
          <Grid container spacing={3} direction="column" alignItems="stretch">
            <Grid size={12}>
              <LogoUploadField logoPreview={logoPreview} onUpload={onLogoUpload} />
            </Grid>
            <Grid size={12}>
              <SettingsField
                label="Organization name"
                required
                error={errors.name?.message}
                description="Displayed in the sidebar and header across your organization workspace"
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
        )}
      </Box>
    </PageCard>
  );
}
