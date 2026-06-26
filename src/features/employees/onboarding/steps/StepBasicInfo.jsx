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
import { EMERGENCY_RELATIONSHIP_OPTIONS, GENDER_OPTIONS } from '../constants';

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
          Legal name, contact channels, profile photo, and emergency contact.
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
              <TextField {...field} fullWidth label="Middle name" error={!!errors.basic?.middleName} helperText={errors.basic?.middleName?.message} />
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
              <TextField {...field} select fullWidth label="Gender" error={!!errors.basic?.gender} helperText={errors.basic?.gender?.message}>
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
                helperText={errors.basic?.dateOfBirth?.message}
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
                type="tel"
                inputMode="tel"
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
              <TextField
                {...field}
                fullWidth
                label="Alternate mobile"
                type="tel"
                inputMode="tel"
                error={!!errors.basic?.alternateMobile}
                helperText={errors.basic?.alternateMobile?.message}
              />
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
                helperText={errors.basic?.profilePhotoUrl?.message || 'Upload to secure storage first, then paste URL — or leave blank.'}
                error={!!errors.basic?.profilePhotoUrl}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ pt: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Emergency contact
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Someone we can reach if we cannot contact the employee. All three fields are optional—leave blank if not
          available now.
        </Typography>
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
                  type="tel"
                  inputMode="tel"
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
      </Box>
    </Stack>
  );
}
