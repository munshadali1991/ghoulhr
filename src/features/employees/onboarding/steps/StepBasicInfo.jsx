import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { fetchStoragePreviewUrl, uploadStorageFile } from '@/shared/api/storageApi';
import { EMERGENCY_RELATIONSHIP_OPTIONS, GENDER_OPTIONS } from '../constants';

const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const PHOTO_ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';

function initialsFromName(firstName, lastName) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '';
}

/**
 * @param {{
 *   duplicateResult?: object,
 *   isEditMode?: boolean,
 *   initialContact?: object,
 *   uploadBatchId?: string,
 *   employeeId?: string,
 * }} props
 */
export function StepBasicInfo({
  duplicateResult,
  isEditMode,
  initialContact,
  uploadBatchId,
  employeeId,
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [photoError, setPhotoError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const localPreviewRef = useRef('');

  const personalEmail = watch('basic.personalEmail');
  const officialEmail = watch('employment.officialEmail');
  const mobileNumber = watch('basic.mobileNumber');
  const firstName = watch('basic.firstName');
  const lastName = watch('basic.lastName');
  const photoPreview = watch('basic.profilePhotoPreviewUrl');
  const photoStorageKey = watch('basic.profilePhotoStorageKey');
  const photoFileName = watch('basic.profilePhotoFileName');

  const emailChanged =
    !isEditMode ||
    !initialContact ||
    personalEmail !== initialContact.personalEmail ||
    officialEmail !== initialContact.officialEmail;
  const mobileChanged =
    !isEditMode || !initialContact || mobileNumber !== initialContact.mobileNumber;

  const showEmailWarning = duplicateResult?.emailTaken && emailChanged;
  const showMobileWarning = duplicateResult?.mobileTaken && mobileChanged;

  const revokeLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = '';
    }
    setLocalPreviewUrl('');
  };

  useEffect(() => {
    return () => revokeLocalPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (photoPreview || !photoStorageKey?.trim()) return;
    let cancelled = false;
    fetchStoragePreviewUrl(photoStorageKey.trim(), 'image/jpeg')
      .then(({ url }) => {
        if (!cancelled && url) {
          setValue('basic.profilePhotoPreviewUrl', url, { shouldDirty: false });
        }
      })
      .catch(() => {
        /* preview optional */
      });
    return () => {
      cancelled = true;
    };
  }, [photoStorageKey, photoPreview, setValue]);

  const handlePhotoPick = async (event) => {
    setPhotoError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoError('Photo must be 2 MB or smaller');
      event.target.value = '';
      return;
    }

    revokeLocalPreview();
    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    setLocalPreviewUrl(objectUrl);

    try {
      setPhotoUploading(true);
      const result = await uploadStorageFile({
        file,
        category: employeeId ? 'employee-documents' : 'staging',
        module: 'profile-photos',
        documentType: 'PROFILE_PHOTO',
        employeeId: employeeId || undefined,
        uploadBatchId: employeeId ? undefined : uploadBatchId,
      });

      setValue('basic.profilePhotoStorageKey', result.storageKey, { shouldDirty: true });
      setValue('basic.profilePhotoFileName', result.fileName, { shouldDirty: true });
      setValue('basic.profilePhotoPreviewUrl', result.previewUrl || '', { shouldDirty: true });
      setValue('basic.profilePhotoUrl', '', { shouldDirty: true });
      revokeLocalPreview();
    } catch (e) {
      setPhotoError(e.message || 'Photo upload failed');
    } finally {
      setPhotoUploading(false);
      event.target.value = '';
    }
  };

  const avatarSrc = photoPreview || localPreviewUrl || undefined;
  const avatarInitials = initialsFromName(firstName, lastName);

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

      {(showEmailWarning || showMobileWarning) && (
        <Alert severity="warning">
          {showEmailWarning && (
            <Typography variant="body2">This email may already exist in your organization.</Typography>
          )}
          {showMobileWarning && (
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
              <TextField
                {...field}
                fullWidth
                label="Middle name"
                error={!!errors.basic?.middleName}
                helperText={errors.basic?.middleName?.message}
              />
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="basic.gender"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Gender"
                error={!!errors.basic?.gender}
                helperText={errors.basic?.gender?.message}
              >
                {GENDER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Avatar src={avatarSrc} sx={{ width: 72, height: 72, bgcolor: 'primary.light' }}>
              {!avatarSrc && avatarInitials ? avatarInitials : null}
            </Avatar>
            <Box>
              <input
                id="hr-profile-photo"
                type="file"
                accept={PHOTO_ACCEPT}
                style={{ display: 'none' }}
                disabled={photoUploading}
                onChange={handlePhotoPick}
              />
              <Button
                component="label"
                htmlFor="hr-profile-photo"
                variant="outlined"
                size="small"
                startIcon={photoUploading ? <CircularProgress size={16} /> : <AttachFileRoundedIcon />}
                disabled={photoUploading}
              >
                {photoUploading ? 'Uploading…' : 'Upload profile photo'}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                PNG or JPG, max 2 MB. Optional.
              </Typography>
              {photoFileName ? (
                <Typography variant="caption" color="text.secondary" display="block">
                  {photoFileName}
                </Typography>
              ) : null}
              {photoError ? (
                <Typography variant="caption" color="error" display="block">
                  {photoError}
                </Typography>
              ) : null}
            </Box>
          </Stack>
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
                  label="Contact phone"
                  type="tel"
                  inputMode="tel"
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
