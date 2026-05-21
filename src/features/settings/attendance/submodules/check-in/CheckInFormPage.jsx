import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, FormControlLabel, Grid, MenuItem, Switch, TextField } from '@mui/material';
import { SettingsField } from '@/shared/components/settings/SettingsField';
import { RecordFormLayout } from '@/features/settings/shared';
import { IpAddressInput } from '@/features/settings/attendance/components/IpAddressInput';
import { checkInFormSchema } from '../../schemas';
import { TRACKING_MODES } from '../../constants';

export function CheckInFormPage({
  checkIn,
  isSaving,
  actionError,
  onClearActionError,
  onBack,
  onSave,
}) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: checkIn,
    resolver: zodResolver(checkInFormSchema),
  });

  const trackingMode = watch('tracking_mode');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSave({
        tracking_mode: values.tracking_mode,
        geo_fencing_enabled: values.geo_fencing_enabled,
        allowed_ip_addresses: values.allowed_ip_addresses,
      });
      onBack();
    } catch {
      /* actionError */
    }
  });

  return (
    <RecordFormLayout
      breadcrumbs={[
        { label: 'Attendance', onClick: onBack },
        { label: 'Check-in', onClick: onBack },
        { label: 'Edit' },
      ]}
      title="Edit check-in settings"
      subtitle="Control how the system validates employee presence."
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isSaving}
      submitLabel="Save changes"
    >
      {actionError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="tracking_mode"
            control={control}
            render={({ field }) => (
              <SettingsField label="Tracking mode" error={errors.tracking_mode?.message}>
                <TextField
                  fullWidth
                  select
                  size="medium"
                  label="Mode"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {TRACKING_MODES.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </TextField>
              </SettingsField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name="geo_fencing_enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                }
                label="Require geo-fencing (on-site proximity)"
              />
            )}
          />
        </Grid>

        {trackingMode === 'ip' ? (
          <Grid size={{ xs: 12 }}>
            <SettingsField
              label="Network allowlist"
              description="Only requests from these addresses can record attendance when mode is IP-based."
            >
              <Controller
                name="allowed_ip_addresses"
                control={control}
                render={({ field }) => (
                  <IpAddressInput value={field.value || []} onChange={field.onChange} />
                )}
              />
            </SettingsField>
          </Grid>
        ) : null}
      </Grid>
    </RecordFormLayout>
  );
}
