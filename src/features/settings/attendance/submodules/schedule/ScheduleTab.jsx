import { Alert, Chip, Stack, Typography } from '@mui/material';
import { SettingsOverviewCard } from '@/features/settings/attendance/components/SettingsOverviewCard';
import { WEEKDAYS } from '../../constants';

export function ScheduleTab({ schedule, actionError, onClearActionError, onEdit }) {
  const dayLabels = (schedule.working_days || [])
    .map((d) => WEEKDAYS.find((w) => w.value === d)?.short || d)
    .join(', ');

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
        onEdit={onEdit}
        rows={[
          {
            label: 'Working days',
            value: (
              <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
                {(schedule.working_days || []).map((d) => (
                  <Chip key={d} size="small" label={WEEKDAYS.find((w) => w.value === d)?.label || d} />
                ))}
                {!schedule.working_days?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    None selected
                  </Typography>
                ) : null}
              </Stack>
            ),
          },
          {
            label: 'Summary',
            value: (
              <Typography variant="body2" color="text.secondary">
                {dayLabels || '—'} · Grace {schedule.grace_period_minutes} min · Half-day from{' '}
                {schedule.half_day_threshold_minutes} min
              </Typography>
            ),
          },
          {
            label: 'Overtime',
            value: (
              <Typography variant="body2">
                {schedule.overtime_enabled ? 'Enabled' : 'Disabled'}
                {schedule.overtime_enabled && schedule.overtime_rules?.multiplier
                  ? ` · ${schedule.overtime_rules.multiplier}× multiplier`
                  : ''}
              </Typography>
            ),
          },
        ]}
      />
    </>
  );
}
