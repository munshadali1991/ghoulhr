import { Alert, Grid } from '@mui/material';
import { OrganizationIdentitySection } from './OrganizationIdentitySection';
import { OrganizationRegionalSection } from './OrganizationRegionalSection';
import { OrganizationProfileSaveBar } from './OrganizationProfileSaveBar';

/**
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<Record<string, string>>,
 *   control: import('react-hook-form').Control<Record<string, string>>,
 *   errors: import('react-hook-form').FieldErrors<Record<string, string>>,
 *   logoPreview: string | null,
 *   onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *   formValues: Record<string, string>,
 *   readOnly?: boolean,
 *   hasChanges?: boolean,
 *   isSaving?: boolean,
 *   onSave?: () => void,
 *   onDiscard?: () => void,
 * }} props
 */
export function OrganizationProfileTab({
  register,
  control,
  errors,
  logoPreview,
  onLogoUpload,
  formValues,
  readOnly = false,
  hasChanges = false,
  isSaving = false,
  onSave,
  onDiscard,
}) {
  return (
    <>
      {readOnly ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have view-only access to organization settings. Contact an administrator to make
          changes.
        </Alert>
      ) : null}

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }}>
          <OrganizationIdentitySection
            register={register}
            errors={errors}
            logoPreview={logoPreview}
            onLogoUpload={onLogoUpload}
            readOnly={readOnly}
            organizationName={formValues.name}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <OrganizationRegionalSection
            control={control}
            errors={errors}
            financialYearStartMonth={formValues.financialYearStartMonth}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      {!readOnly && onSave && onDiscard ? (
        <OrganizationProfileSaveBar
          hasChanges={hasChanges}
          isSaving={isSaving}
          onSave={onSave}
          onDiscard={onDiscard}
        />
      ) : null}
    </>
  );
}
