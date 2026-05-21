import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { FormLabelRow } from './FormLabelRow';
import { FormSectionCard } from './FormSectionCard';
import { MOCK_SESSIONS } from '../mocks/employeePortalMocks';

/**
 * @param {{
 *   form: ReturnType<import('../hooks/useLeaveApplyForm').useLeaveApplyForm>,
 *   leaveTypes: { value: string; label: string }[],
 *   approvers: { value: string; label: string }[],
 *   onSubmit: (values: object) => void,
 *   submitting?: boolean,
 * }} props
 */
export function LeaveApplyForm({ form, leaveTypes, approvers, onSubmit, submitting }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const [policyOpen, setPolicyOpen] = useState(true);
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Collapse in={policyOpen}>
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Link component="button" variant="body2" onClick={() => setPolicyOpen(false)}>
              Hide
            </Link>
          }
        >
          Leave requests require manager approval. Half-day leaves count as 0.5 days against your balance.
        </Alert>
      </Collapse>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Applying for Leave
      </Typography>

      <FormSectionCard title="Leave details">
        <FormLabelRow label="Leave type" required>
          <Controller
            name="leaveType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={Boolean(errors.leaveType)}>
                <InputLabel>Select type</InputLabel>
                <Select {...field} label="Select type">
                  {leaveTypes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.leaveType ? (
                  <Typography variant="caption" color="error">
                    {errors.leaveType.message}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          />
        </FormLabelRow>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <FormLabelRow label="From date" required>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Select date"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DD') : '')}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: Boolean(errors.fromDate),
                          helperText: errors.fromDate?.message,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="fromSession"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Session</InputLabel>
                      <Select {...field} label="Session">
                        {MOCK_SESSIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </FormLabelRow>

            <FormLabelRow label="To date" required>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Select date"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DD') : '')}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: Boolean(errors.toDate),
                          helperText: errors.toDate?.message,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="toSession"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Session</InputLabel>
                      <Select {...field} label="Session">
                        {MOCK_SESSIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </FormLabelRow>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Leave Balance:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                7.7
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Applying For:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fromDate && toDate ? '—' : '—'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <FormLabelRow label="Applying to">
          <Controller
            name="applyingTo"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={Boolean(errors.applyingTo)}>
                <InputLabel>Applying to</InputLabel>
                <Select {...field} label="Applying to">
                  {approvers.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.applyingTo ? (
                  <Typography variant="caption" color="error">
                    {errors.applyingTo.message}
                  </Typography>
                ) : null}
              </FormControl>
            )}
          />
        </FormLabelRow>

        <FormLabelRow label="Contact Details">
          <Controller
            name="contactDetails"
            control={control}
            render={({ field }) => <TextField {...field} size="small" fullWidth />}
          />
        </FormLabelRow>

        <FormLabelRow label="Reason" required>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={3}
                fullWidth
                size="small"
                placeholder="Enter a reason"
                error={Boolean(errors.reason)}
                helperText={errors.reason?.message}
              />
            )}
          />
        </FormLabelRow>

        <Box sx={{ py: 1 }}>
          <Link component="button" variant="body2" underline="hover">
            Attach File
          </Link>
          <Typography variant="caption" color="text.secondary" display="block">
            pdf, xls, xlsx, doc, docx, txt, ppt, pptx, gif, jpg, jpeg, png
          </Typography>
        </Box>
      </FormSectionCard>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="secondary" disabled={submitting}>
          Submit
        </Button>
        <Button type="button" variant="outlined" color="secondary" onClick={() => form.reset()}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
