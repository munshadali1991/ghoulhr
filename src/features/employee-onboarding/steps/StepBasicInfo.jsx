import {
  Alert,
  Box,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { GENDER_OPTIONS } from '../constants';

export function StepBasicInfo({ duplicateResult }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 1
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Basic information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Legal name, contact channels, and profile photo.
        </Typography>
      </Box>

      {(duplicateResult?.emailTaken || duplicateResult?.mobileTaken) && (
        <Alert severity="warning">
          {duplicateResult.emailTaken && (
            <Typography variant="body2">This email may already exist in your organization.</Typography>
          )}
          {duplicateResult.mobileTaken && (
            <Typography variant="body2">This mobile number may already be registered.</Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="basic.firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="First name"
                error={!!errors.basic?.firstName}
                helperText={errors.basic?.firstName?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="basic.middleName"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Middle name" error={!!errors.basic?.middleName} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="basic.lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="Last name"
                error={!!errors.basic?.lastName}
                helperText={errors.basic?.lastName?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="basic.gender"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Gender">
                <MenuItem value="">Not specified</MenuItem>
                {GENDER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="basic.dateOfBirth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Date of birth"
                InputLabelProps={{ shrink: true }}
                error={!!errors.basic?.dateOfBirth}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="basic.personalEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                type="email"
                label="Personal email"
                error={!!errors.basic?.personalEmail}
                helperText={errors.basic?.personalEmail?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="basic.mobileNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="Mobile number"
                error={!!errors.basic?.mobileNumber}
                helperText={errors.basic?.mobileNumber?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="basic.alternateMobile"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Alternate mobile" error={!!errors.basic?.alternateMobile} />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="basic.profilePhotoUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Profile photo URL"
                placeholder="https://… (file storage integration coming next)"
                helperText="Upload to secure storage first, then paste URL — or leave blank."
              />
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
