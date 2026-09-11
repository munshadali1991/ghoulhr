import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { RhfDesktopTimePicker } from '@/shared/components/forms/RhfDesktopTimePicker';
import { FormLabelRow } from '../FormLabelRow';
import { FormSectionCard } from '../FormSectionCard';

/**
 * @param {{
 *   form: ReturnType<import('../../hooks/useRegularizationApplyForm').useRegularizationApplyForm>,
 *   hasAssignedManager?: boolean,
 *   approverName?: string | null,
 *   onSubmit: (values: object) => void,
 *   submitting?: boolean,
 * }} props
 */
export function RegularizationApplyForm({
  form,
  hasAssignedManager = false,
  approverName,
  onSubmit,
  submitting,
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormSectionCard
        title="Regularization request"
        description="Submit forgotten check-in or check-out times for your manager to approve."
        flush
      >
        <FormLabelRow label="Date" required hint="Today or a past working day">
          <Controller
            name="workDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) => field.onChange(v && v.isValid() ? v.format('YYYY-MM-DD') : '')}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: Boolean(errors.workDate),
                    helperText: errors.workDate?.message,
                  },
                }}
              />
            )}
          />
        </FormLabelRow>

        <FormLabelRow label="In time" required>
          <RhfDesktopTimePicker control={control} name="inTime" label="In time" />
        </FormLabelRow>

        <FormLabelRow label="Out time" required>
          <RhfDesktopTimePicker control={control} name="outTime" label="Out time" />
          {errors.outTime?.message ? (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.outTime.message}
            </Typography>
          ) : null}
        </FormLabelRow>

        <FormLabelRow label="Reason" required hint="Why the punch was missed" divider={false}>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={3}
                size="small"
                error={Boolean(errors.reason)}
                helperText={errors.reason?.message}
              />
            )}
          />
        </FormLabelRow>
      </FormSectionCard>

      <Box sx={{ mt: 2 }}>
        {!hasAssignedManager ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            A reporting manager must be assigned before you can submit a regularization
            request. Contact HR if this looks wrong.
          </Alert>
        ) : approverName ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Request will be sent to <strong>{approverName}</strong>
          </Typography>
        ) : null}

        <Stack direction="row" justifyContent="flex-end">
          <CrudButton
            intent="create"
            type="submit"
            disabled={submitting || !hasAssignedManager}
          >
            Submit request
          </CrudButton>
        </Stack>
      </Box>
    </form>
  );
}
