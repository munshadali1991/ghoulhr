import { Alert, Chip, Stack, Typography } from '@mui/material';
import {
  SettingsOverviewCard,
  SettingsOverviewRow,
} from '@/features/settings/attendance/components/SettingsOverviewCard';
import { TRACKING_MODES } from '../../constants';

const IP_CHIP_LIMIT = 6;

export function CheckInTab({ checkIn, actionError, onClearActionError }) {
  const mode = TRACKING_MODES.find((m) => m.value === checkIn.tracking_mode);
  const modeLabel = mode?.label || checkIn.tracking_mode;
  const ips = checkIn.allowed_ip_addresses || [];
  const isIpMode = checkIn.tracking_mode === 'ip';
  const visibleIps = ips.slice(0, IP_CHIP_LIMIT);
  const hiddenCount = Math.max(0, ips.length - visibleIps.length);

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
      >
        <SettingsOverviewRow label="Tracking mode">
          <Stack spacing={0.75}>
            <Chip size="small" label={modeLabel} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
            {mode?.description ? (
              <Typography variant="body2" color="text.secondary">
                {mode.description}
              </Typography>
            ) : null}
          </Stack>
        </SettingsOverviewRow>

        <SettingsOverviewRow label="Geo-fencing">
          <Typography variant="body2">
            {checkIn.geo_fencing_enabled ? 'Required on-site proximity' : 'Not required'}
          </Typography>
        </SettingsOverviewRow>

        <SettingsOverviewRow label="IP allowlist">
          {isIpMode ? (
            ips.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No addresses configured
              </Typography>
            ) : (
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {ips.length} address{ips.length === 1 ? '' : 'es'} configured
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
                  {visibleIps.map((ip) => (
                    <Chip key={ip} size="small" label={ip} variant="outlined" sx={{ height: 24 }} />
                  ))}
                  {hiddenCount > 0 ? (
                    <Chip size="small" label={`+${hiddenCount} more`} sx={{ height: 24 }} />
                  ) : null}
                </Stack>
              </Stack>
            )
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not used for this mode
            </Typography>
          )}
        </SettingsOverviewRow>
      </SettingsOverviewCard>
    </>
  );
}
