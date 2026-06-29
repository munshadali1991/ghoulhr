import { useEffect, useMemo, useRef, useState } from 'react';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
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
import { LeaveCcEmployeePicker } from './LeaveCcEmployeePicker';
import { LeavePreviewSummary } from './LeavePreviewSummary';
import { MOCK_SESSIONS } from '../mocks/employeePortalMocks';
import { useLeaveBalances, useLeavePreview } from '../hooks/useEmployeePortalQueries';
import { useAuth } from '@/app/providers/useAuth';
import { uploadStorageFile } from '@/shared/api/storageApi';

const ACCEPTED_FILE_TYPES =
  '.pdf,.xls,.xlsx,.doc,.docx,.txt,.ppt,.pptx,.gif,.jpg,.jpeg,.png';

/**
 * @param {{
 *   form: ReturnType<import('../hooks/useLeaveApplyForm').useLeaveApplyForm>,
 *   leaveTypes: { value: string; label: string }[],
 *   approvers: { value: string; label: string }[],
 *   rules?: Array<{
 *     leaveConfigurationId: string,
 *     allowHalfDay?: boolean,
 *     maxConsecutiveDays?: number,
 *     requiresSupportingDocument?: boolean,
 *     supportingDocumentAfterDays?: number,
 *     requiresApproval?: boolean,
 *   }>,
 *   onSubmit: (values: object) => void,
 *   submitting?: boolean,
 * }} props
 */
export function LeaveApplyForm({
  form,
  leaveTypes,
  approvers,
  rules = [],
  onSubmit,
  submitting,
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = form;

  useEffect(() => {
    const first = approvers[0]?.value;
    if (!first) return;
    const current = getValues('applyingTo');
    if (!current || !approvers.some((a) => a.value === current)) {
      setValue('applyingTo', first, { shouldValidate: true });
    }
  }, [approvers, getValues, setValue]);

  const [policyOpen, setPolicyOpen] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef(null);
  const { session } = useAuth();
  const employeeId = session?.user?.id;
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const fromSession = watch('fromSession');
  const toSession = watch('toSession');
  const leaveType = watch('leaveType');
  const applyingTo = watch('applyingTo');

  const previewParams = useMemo(
    () =>
      leaveType && fromDate && toDate
        ? { leaveType, fromDate, toDate, fromSession, toSession }
        : null,
    [leaveType, fromDate, toDate, fromSession, toSession],
  );
  const previewQuery = useLeavePreview(previewParams);

  const balanceYear = fromDate ? dayjs(fromDate).year() : dayjs().year();
  const balancesQuery = useLeaveBalances(balanceYear);

  const remainingBalance = useMemo(() => {
    if (previewQuery.data?.currentBalance != null) {
      return previewQuery.data.currentBalance;
    }
    if (!leaveType) return null;
    return balancesQuery.data?.balances?.find((b) => b.id === leaveType)?.balance ?? null;
  }, [previewQuery.data, leaveType, balancesQuery.data]);

  const balanceLoading =
    (Boolean(previewParams) && previewQuery.isLoading) ||
    (Boolean(leaveType) && balancesQuery.isLoading && remainingBalance == null);

  const selectedRule = useMemo(
    () => rules.find((r) => r.leaveConfigurationId === leaveType),
    [rules, leaveType],
  );

  const policyLines = useMemo(() => {
    const lines = [];
    if (selectedRule?.requiresApproval !== false) {
      lines.push('Leave requests require manager approval.');
    }
    if (selectedRule?.allowHalfDay !== false) {
      lines.push('Half-day leaves count as 0.5 days against your balance.');
    }
    if (selectedRule?.maxConsecutiveDays != null) {
      lines.push(
        `Maximum ${selectedRule.maxConsecutiveDays} consecutive day(s) per request.`,
      );
    }
    if (selectedRule?.requiresSupportingDocument) {
      const after = selectedRule.supportingDocumentAfterDays ?? 0;
      lines.push(
        after > 0
          ? `A supporting document is required when leave is ${after} day(s) or longer.`
          : 'A supporting document is required for this leave type.',
      );
    }
    return lines.length > 0
      ? lines
      : ['Leave requests require manager approval. Half-day leaves count as 0.5 days against your balance.'];
  }, [selectedRule]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAttachment(null);
      return;
    }
    if (!employeeId) {
      setAttachmentError('Sign in again to attach a document.');
      return;
    }

    setAttachmentError('');
    try {
      setAttachmentUploading(true);
      const result = await uploadStorageFile({
        file,
        category: 'employee-documents',
        module: 'leave',
        documentType: 'LEAVE_SUPPORTING',
        employeeId,
      });
      setAttachment({
        documentType: 'LEAVE_SUPPORTING',
        fileName: result.fileName,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        storageKey: result.storageKey,
      });
    } catch (e) {
      setAttachmentError(e.message || 'Failed to upload attachment');
      setAttachment(null);
    } finally {
      setAttachmentUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (values) => {
    onSubmit({
      ...values,
      supportingDocument: attachment ?? undefined,
    });
  };

  const handleReset = () => {
    form.reset();
    handleRemoveAttachment();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Collapse in={policyOpen}>
        <Alert
          severity="warning"
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            '& .MuiAlert-action': {
              pt: { xs: 0.5, sm: 0 },
              pl: { xs: 0, sm: 2 },
              mr: 0,
              alignSelf: { xs: 'flex-start', sm: 'center' },
            },
            '& .MuiAlert-message': { minWidth: 0 },
          }}
          action={
            <Link component="button" variant="body2" onClick={() => setPolicyOpen(false)} sx={{ whiteSpace: 'nowrap' }}>
              Hide
            </Link>
          }
        >
          {policyLines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </Alert>
      </Collapse>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ letterSpacing: '-0.01em', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Applying for Leave
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Complete the form below to submit a leave request for approval.
        </Typography>
      </Box>

      <Stack spacing={3}>
        <FormSectionCard title="Leave details" description="Type, duration, and approver" flush>
          <FormLabelRow label="Leave type" required>
            <Controller
              name="leaveType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={Boolean(errors.leaveType)}>
                  <InputLabel id="leave-type-label">Select type</InputLabel>
                  <Select {...field} labelId="leave-type-label" label="Select type">
                    {leaveTypes.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.leaveType ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.leaveType.message}
                    </Typography>
                  ) : null}
                </FormControl>
              )}
            />
          </FormLabelRow>

          <FormLabelRow
            label="Leave period"
            required
            fullWidth
            hint="Select dates and sessions for half-day leave"
          >
            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                    >
                      From
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <Controller
                          name="fromDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              label="Start date"
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
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <Controller
                          name="fromSession"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel id="from-session-label">Session</InputLabel>
                              <Select {...field} labelId="from-session-label" label="Session">
                                {MOCK_SESSIONS.map((s) => (
                                  <MenuItem key={s.value} value={s.value}>
                                    {s.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                    >
                      To
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <Controller
                          name="toDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              label="End date"
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
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <Controller
                          name="toSession"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel id="to-session-label">Session</InputLabel>
                              <Select {...field} labelId="to-session-label" label="Session">
                                {MOCK_SESSIONS.map((s) => (
                                  <MenuItem key={s.value} value={s.value}>
                                    {s.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <LeavePreviewSummary
                  balance={remainingBalance}
                  loading={balanceLoading}
                  active={Boolean(leaveType)}
                />
              </Grid>
            </Grid>
          </FormLabelRow>

          <FormLabelRow label="Approver" required hint="Your leave request will be routed here">
            <Controller
              name="applyingTo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={Boolean(errors.applyingTo)}>
                  <InputLabel id="leave-approver-label">Select approver</InputLabel>
                  <Select
                    {...field}
                    labelId="leave-approver-label"
                    label="Select approver"
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return 'Select an approver';
                      return approvers.find((a) => a.value === selected)?.label ?? selected;
                    }}
                  >
                    {approvers.map((a) => (
                      <MenuItem key={a.value} value={a.value}>
                        {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.applyingTo ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.applyingTo.message}
                    </Typography>
                  ) : null}
                </FormControl>
              )}
            />
          </FormLabelRow>

          <FormLabelRow label="Cc" divider={false} fullWidth hint="Notify colleagues about your leave">
            <Controller
              name="ccEmployeeIds"
              control={control}
              render={({ field }) => (
                <LeaveCcEmployeePicker
                  value={field.value ?? []}
                  onChange={field.onChange}
                  excludeEmployees={
                    applyingTo
                      ? approvers
                          .filter((a) => a.value === applyingTo)
                          .map((a) => ({ id: a.value, name: a.label }))
                      : []
                  }
                />
              )}
            />
          </FormLabelRow>
        </FormSectionCard>

        <FormSectionCard title="Additional details" description="Contact info, reason, and attachments" flush>
          <FormLabelRow label="Contact details" hint="Reachable while on leave">
            <Controller
              name="contactDetails"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  placeholder="Phone number or email"
                />
              )}
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
                  minRows={4}
                  fullWidth
                  size="small"
                  placeholder="Briefly describe the reason for your leave"
                  error={Boolean(errors.reason)}
                  helperText={errors.reason?.message}
                />
              )}
            />
          </FormLabelRow>

          <FormLabelRow label="Attachment" divider={false}>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileChange}
              />

              {attachment ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                  }}
                >
                  <AttachFileOutlinedIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    sx={{ flex: '1 1 120px', minWidth: 0, wordBreak: 'break-word' }}
                    title={attachment.fileName}
                  >
                    {attachment.fileName}
                  </Typography>
                  <IconButton size="small" aria-label="Remove attachment" onClick={handleRemoveAttachment}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  component="button"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: 96,
                    px: 2,
                    py: 2,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <AttachFileOutlinedIcon color="action" sx={{ mb: 0.75 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Attach file
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                    PDF, Office docs, or images up to standard size limits
                  </Typography>
                </Box>
              )}

              {attachmentError ? (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {attachmentError}
                </Typography>
              ) : null}

              {selectedRule?.requiresSupportingDocument ? (
                <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                  Supporting document may be required based on leave duration (HR policy).
                </Typography>
              ) : null}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Accepted: pdf, xls, xlsx, doc, docx, txt, ppt, pptx, gif, jpg, jpeg, png
              </Typography>
            </Box>
          </FormLabelRow>
        </FormSectionCard>
      </Stack>

      <Divider sx={{ mt: 3, mb: 2.5 }} />

      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        spacing={1.5}
        justifyContent="flex-end"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={handleReset}
          disabled={submitting}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={submitting}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 } }}
        >
          Submit request
        </Button>
      </Stack>
    </Box>
  );
}
