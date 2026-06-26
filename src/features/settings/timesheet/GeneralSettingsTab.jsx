import {
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { WEEK_START_OPTIONS } from './constants';

/**
 * @param {{ form: ReturnType<typeof import('./hooks/useTimesheetSettingsForm').useTimesheetSettingsForm> }} props
 */
export function GeneralSettingsTab({ form, readOnly = false }) {
  return (
    <form onSubmit={readOnly ? (e) => e.preventDefault() : form.onSubmit}>
      <PageCard sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Limits & rules
        </Typography>
        <Stack spacing={2.5}>
          <TextField
            label="Max hours per day"
            type="number"
            inputProps={{ min: 1, max: 24, step: 0.5 }}
            {...form.register('max_hours_per_day')}
            error={Boolean(form.formState.errors.max_hours_per_day)}
            helperText={form.formState.errors.max_hours_per_day?.message}
            fullWidth
            disabled={readOnly}
          />
          <TextField
            label="Max past days allowed for entry"
            type="number"
            inputProps={{ min: 0, max: 30, step: 1 }}
            {...form.register('max_past_days')}
            error={Boolean(form.formState.errors.max_past_days)}
            helperText={
              form.formState.errors.max_past_days?.message ??
              'How far back employees may log or edit timesheets.'
            }
            fullWidth
            disabled={readOnly}
          />
          <TextField
            select
            label="Week starts on"
            {...form.register('week_starts_on')}
            fullWidth
            disabled={readOnly}
          >
            {WEEK_START_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                {...form.register('require_submission_by_eod')}
                checked={form.watch('require_submission_by_eod')}
                onChange={(e) =>
                  form.setValue('require_submission_by_eod', e.target.checked, {
                    shouldDirty: true,
                  })
                }
                disabled={readOnly}
              />
            }
            label="Show end-of-day submission reminder on employee home"
          />
        </Stack>
      </PageCard>

      <PageCard sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Employee guidance
        </Typography>
        <TextField
          label="Helper text (shown on My Timesheet)"
          multiline
          minRows={3}
          {...form.register('employee_helper_text')}
          error={Boolean(form.formState.errors.employee_helper_text)}
          helperText={form.formState.errors.employee_helper_text?.message}
          fullWidth
          disabled={readOnly}
        />
      </PageCard>

      {!readOnly ? (
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        spacing={2}
        justifyContent="flex-end"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <BrandedButton
          type="button"
          variant="outlined"
          onClick={form.handleReset}
          disabled={!form.formState.isDirty || form.isUpdating}
          fullWidth
          sx={{ display: { xs: 'flex', sm: 'inline-flex' }, width: { sm: 'auto' } }}
        >
          Reset
        </BrandedButton>
        <BrandedButton
          type="submit"
          disabled={!form.formState.isDirty || form.isUpdating}
          fullWidth
          sx={{ display: { xs: 'flex', sm: 'inline-flex' }, width: { sm: 'auto' } }}
        >
          {form.isUpdating ? 'Saving…' : 'Save settings'}
        </BrandedButton>
      </Stack>
      ) : null}
    </form>
  );
}
