import { Alert, Chip, Stack, Typography } from '@mui/material';
import {
  SettingsMetricStrip,
  SettingsOverviewCard,
  SettingsOverviewRow,
} from '@/features/settings/attendance/components/SettingsOverviewCard';
import { WEEKDAYS } from '../../constants';

export function ScheduleTab({ schedule, actionError, onClearActionError }) {
  return (
    <>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <SettingsOverviewCard
        title="Schedule & attendance rules"
        description="Working week, lateness grace, half-day threshold, and overtime policy."
      >
        <SettingsOverviewRow label="Working week">
          <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
            {(schedule.working_days || []).map((d) => (
              <Chip
                key={d}
                size="small"
                label={WEEKDAYS.find((w) => w.value === d)?.short || d}
                sx={{ height: 24, fontWeight: 600 }}
              />
            ))}
            {!schedule.working_days?.length ? (
              <Typography variant="body2" color="text.secondary">
                None selected
              </Typography>
            ) : null}
          </Stack>
        </SettingsOverviewRow>

        <SettingsOverviewRow label="Rules">
          <SettingsMetricStrip
            items={[
              {
                label: 'Grace',
                value: `${schedule.grace_period_minutes ?? 0} min`,
                hint: 'Late arrival buffer',
              },
              {
                label: 'Half-day from',
                value: `${schedule.half_day_threshold_minutes ?? 0} min`,
                hint: 'Worked minutes threshold',
              },
              {
                label: 'Overtime',
                value: schedule.overtime_enabled ? 'Enabled' : 'Disabled',
                hint:
                  schedule.overtime_enabled && schedule.overtime_rules?.multiplier
                    ? `${schedule.overtime_rules.multiplier}× multiplier`
                    : 'Not applied',
              },
            ]}
          />
        </SettingsOverviewRow>
      </SettingsOverviewCard>
    </>
  );
}
