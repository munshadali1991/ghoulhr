import { Box, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { EMERGENCY_RELATIONSHIP_OPTIONS } from '../constants';

export function StepEmergency() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 6
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Emergency contact
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Someone we can reach if we cannot contact the employee. All three fields are optional—leave blank if not
          available now.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="emergency.contactName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Contact name"
                placeholder="Full name"
                error={!!errors.emergency?.contactName}
                helperText={errors.emergency?.contactName?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="emergency.contactPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Contact number"
                placeholder="Phone with country code if needed"
                error={!!errors.emergency?.contactPhone}
                helperText={errors.emergency?.contactPhone?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="emergency.relationship"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Relationship"
                error={!!errors.emergency?.relationship}
                helperText={errors.emergency?.relationship?.message}
              >
                <MenuItem value="">
                  <em>Select…</em>
                </MenuItem>
                {EMERGENCY_RELATIONSHIP_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
