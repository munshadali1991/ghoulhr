import { Alert, Chip, Typography } from '@mui/material';
import { SettingsOverviewCard } from '@/features/settings/attendance/components/SettingsOverviewCard';
import { TRACKING_MODES } from '../../constants';

export function CheckInTab({ checkIn, actionError, onClearActionError, onEdit }) {
  const modeLabel =
    TRACKING_MODES.find((m) => m.value === checkIn.tracking_mode)?.label || checkIn.tracking_mode;

  return (
    <>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <SettingsOverviewCard
        title="Check-in & validation"
        description="How employees record attendance and what validations apply."
        onEdit={onEdit}
        rows={[
          {
            label: 'Tracking mode',
            value: <Chip size="small" label={modeLabel} color="primary" variant="outlined" />,
          },
          {
            label: 'Geo-fencing',
            value: (
              <Typography variant="body2">
                {checkIn.geo_fencing_enabled ? 'Required on-site proximity' : 'Not required'}
              </Typography>
            ),
          },
          {
            label: 'IP allowlist',
            value: (
              <Typography variant="body2" color="text.secondary">
                {checkIn.tracking_mode === 'ip'
                  ? `${checkIn.allowed_ip_addresses?.length || 0} address(es) configured`
                  : 'Only applies when mode is IP-based'}
              </Typography>
            ),
          },
        ]}
      />
    </>
  );
}
