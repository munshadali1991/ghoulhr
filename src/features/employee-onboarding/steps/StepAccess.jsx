import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { PORTAL_ROLE_OPTIONS } from '../constants';

export function StepAccess() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

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
          HRMS role mapping and security toggles. Temporary password is optional — one is generated if left blank.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="access.portalRoleLabel"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                required
                label="Employee role (HRMS)"
                error={!!errors.access?.portalRoleLabel}
                helperText={errors.access?.portalRoleLabel?.message}
              >
                {PORTAL_ROLE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="access.hrmsAccessEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={!!field.value} onChange={(_, c) => field.onChange(c)} />}
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
                control={<Switch checked={!!field.value} onChange={(_, c) => field.onChange(c)} />}
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
                control={<Switch checked={!!field.value} onChange={(_, c) => field.onChange(c)} />}
                label="MFA enabled (enforcement phase 2)"
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="access.temporaryPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="Temporary password (optional)"
                helperText="Min 12 chars if set; complexity rules apply on save."
                error={!!errors.access?.temporaryPassword}
              />
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
