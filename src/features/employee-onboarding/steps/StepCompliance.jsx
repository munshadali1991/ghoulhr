import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export function StepCompliance() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 4
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Government & compliance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PAN and Aadhaar are validated here and encrypted on the server. Other identifiers follow the same storage policy.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.panNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="PAN"
                placeholder="ABCDE1234F"
                error={!!errors.compliance?.panNumber}
                helperText={errors.compliance?.panNumber?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.aadhaarNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Aadhaar"
                placeholder="12 digits"
                error={!!errors.compliance?.aadhaarNumber}
                helperText={errors.compliance?.aadhaarNumber?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.uanNumber"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="UAN" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.esicNumber"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="ESIC number" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.pfNumber"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="PF number" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.passportNumber"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Passport number" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="compliance.passportExpiry"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type="date" label="Passport expiry" InputLabelProps={{ shrink: true }} />
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
