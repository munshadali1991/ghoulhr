import {
  Box,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export function StepAccess({ isEditMode = false, readOnly = false }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const passwordHelperText =
    errors.access?.temporaryPassword?.message ||
    (readOnly
      ? 'Password is not shown for security.'
      : isEditMode
        ? 'Leave blank to keep the current password. Min 12 chars with upper, lower, number, and special character if set.'
        : 'Min 12 chars with upper, lower, number, and special character. One is generated if left blank.');

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 7
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          System access
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {readOnly
            ? 'Security toggles for portal access. Roles are assigned in Settings → RBAC → Employees.'
            : isEditMode
              ? 'Security toggles and optional password reset. Assign roles in Settings → RBAC → Employees.'
              : 'Security toggles for portal access. Assign roles in Settings → RBAC → Employees after onboarding.'}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={12}>
          <Controller
            name="access.hrmsAccessEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(_, c) => field.onChange(c)}
                    disabled={readOnly}
                  />
                }
                label="HRMS access enabled"
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="access.welcomeEmailEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(_, c) => field.onChange(c)}
                    disabled={readOnly}
                  />
                }
                label="Send welcome email (when mail provider is configured)"
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="access.mfaEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(_, c) => field.onChange(c)}
                    disabled={readOnly}
                  />
                }
                label="MFA enabled (enforcement phase 2)"
              />
            )}
          />
        </Grid>
        {!readOnly ? (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="access.temporaryPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label={isEditMode ? 'New password (optional)' : 'Temporary password (optional)'}
                  helperText={passwordHelperText}
                  error={!!errors.access?.temporaryPassword}
                />
              )}
            />
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  );
}
