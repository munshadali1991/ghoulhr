import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useAuth } from '@/app/providers/useAuth';
import { uploadStorageFile } from '@/shared/api/storageApi';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import {
  useAddExpenseLine,
  useCreateExpenseClaim,
  useDeleteExpenseLine,
  useExpenseCategories,
  useOwnExpenseClaim,
  useSubmitExpenseClaim,
  useUpdateExpenseClaim,
  useUpdateExpenseLine,
} from '../hooks/useExpenseQueries';
import {
  findFutureDatedLineMessage,
  firstErrorField,
  localTodayKey,
  validateClaimTitle,
  validateExpenseLineForm,
} from '../expenseFormValidation';

const EDITABLE = new Set(['DRAFT', 'SENT_BACK']);

const EMPTY_LINE_FORM = {
  categoryId: '',
  expenseDate: '',
  merchant: '',
  description: '',
  amount: '',
};

const FIELD_INPUT_IDS = {
  title: 'expense-claim-title',
  categoryId: 'expense-line-category',
  expenseDate: 'expense-line-date',
  merchant: 'expense-line-merchant',
  description: 'expense-line-description',
  amount: 'expense-line-amount',
  receipt: 'expense-line-receipt-input',
};

function isLineFormDirty(form) {
  return Boolean(
    form.categoryId ||
      form.expenseDate ||
      form.merchant.trim() ||
      form.description.trim() ||
      form.amount.trim(),
  );
}

function focusField(fieldKey) {
  if (!fieldKey) return;
  const id = FIELD_INPUT_IDS[fieldKey];
  if (!id) return;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.focus?.();
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  });
}

export function ExpenseClaimEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { session } = useAuth();
  const employeeId = session?.user?.id;
  const { snackbar, show, close } = useAppSnackbar();
  const showAttemptedRef = useRef(false);

  const categoriesQuery = useExpenseCategories();
  const claimQuery = useOwnExpenseClaim(isNew ? null : id, !isNew);
  const createClaim = useCreateExpenseClaim();
  const updateClaim = useUpdateExpenseClaim();
  const addLine = useAddExpenseLine();
  const updateLine = useUpdateExpenseLine();
  const deleteLine = useDeleteExpenseLine();
  const submitClaim = useSubmitExpenseClaim();

  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [claimId, setClaimId] = useState(isNew ? null : id);
  const [lineForm, setLineForm] = useState(EMPTY_LINE_FORM);
  const [receiptFile, setReceiptFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addPanelOpen, setAddPanelOpen] = useState(isNew);
  const [lineErrors, setLineErrors] = useState({});
  const [titleError, setTitleError] = useState('');
  const [showLineValidationAlert, setShowLineValidationAlert] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const todayKey = useMemo(() => localTodayKey(), []);

  const claim = claimQuery.data;
  const editable = isNew || (claim && EDITABLE.has(claim.status));
  const categories = categoriesQuery.data ?? [];
  const lines = claim?.lines ?? [];

  const missingReceiptCount = useMemo(
    () => lines.filter((line) => !line.hasReceipt).length,
    [lines],
  );

  useEffect(() => {
    if (claim) {
      setTitle(claim.title || '');
      setPurpose(claim.purpose || '');
      setClaimId(claim.id);
      const lineCount = (claim.lines ?? []).length;
      setAddPanelOpen(lineCount === 0);
    }
  }, [claim]);

  const resetLineForm = () => {
    setLineForm(EMPTY_LINE_FORM);
    setReceiptFile(null);
    setLineErrors({});
    setShowLineValidationAlert(false);
    showAttemptedRef.current = false;
  };

  const updateLineField = (key, value) => {
    setLineForm((s) => ({ ...s, [key]: value }));
    setLineErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const ensureClaim = async () => {
    if (claimId) {
      if (editable && (title !== claim?.title || purpose !== (claim?.purpose || ''))) {
        await updateClaim.mutateAsync({
          id: claimId,
          payload: { title, purpose },
        });
      }
      return claimId;
    }
    const created = await createClaim.mutateAsync({ title, purpose });
    setClaimId(created.id);
    navigate(`/expense/claims/${created.id}`, { replace: true });
    return created.id;
  };

  /** @returns {boolean} */
  const assertTitleValid = () => {
    const titleErrors = validateClaimTitle(title);
    if (titleErrors.title) {
      setTitleError(titleErrors.title);
      focusField('title');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSaveHeader = async () => {
    try {
      setSaving(true);
      if (!assertTitleValid()) return;
      await ensureClaim();
      show('Claim saved', 'success');
    } catch (err) {
      show(err?.message || 'Failed to save claim', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * @param {{ collapseOnSuccess?: boolean, silentSuccess?: boolean }} options
   */
  const saveExpenseFromForm = async ({
    collapseOnSuccess = true,
    silentSuccess = false,
  } = {}) => {
    showAttemptedRef.current = true;
    const errors = validateExpenseLineForm(lineForm, receiptFile, {
      requireReceipt: true,
      todayKey,
    });
    setLineErrors(errors);

    if (Object.keys(errors).length) {
      setShowLineValidationAlert(true);
      setAddPanelOpen(true);
      focusField(firstErrorField(errors));
      return false;
    }

    setShowLineValidationAlert(false);

    if (!assertTitleValid()) {
      return false;
    }

    if (!employeeId) {
      show('Your session is missing an employee id. Please log in again.', 'error');
      return false;
    }

    const idToUse = await ensureClaim();
    const uploaded = await uploadStorageFile({
      file: receiptFile,
      category: 'employee-documents',
      module: 'expense',
      documentType: 'EXPENSE_RECEIPT',
      employeeId,
      expenseClaimId: idToUse,
    });
    const receipt = {
      documentType: 'EXPENSE_RECEIPT',
      fileName: uploaded.fileName,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      storageKey: uploaded.storageKey,
    };

    await addLine.mutateAsync({
      claimId: idToUse,
      payload: {
        categoryId: lineForm.categoryId,
        expenseDate: lineForm.expenseDate,
        merchant: lineForm.merchant.trim(),
        description: lineForm.description.trim(),
        amount: String(lineForm.amount),
        receipt,
      },
    });

    resetLineForm();
    if (collapseOnSuccess) setAddPanelOpen(false);
    if (!silentSuccess) show('Expense saved', 'success');
    await claimQuery.refetch();
    return true;
  };

  const handleSaveExpense = async () => {
    try {
      setSaving(true);
      await saveExpenseFromForm({ collapseOnSuccess: true });
    } catch (err) {
      show(err?.message || 'Failed to save expense', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    resetLineForm();
    setAddPanelOpen(false);
  };

  const handleDeleteLine = async (lineId) => {
    try {
      await deleteLine.mutateAsync({ claimId, lineId });
      show('Expense removed', 'success');
      await claimQuery.refetch();
    } catch (err) {
      show(err?.message || 'Failed to remove expense', 'error');
    }
  };

  const handleAttachReceiptToLine = async (lineId, file) => {
    if (!file) return;
    if (!claimId) {
      show('Save the claim draft first', 'error');
      return;
    }
    if (!employeeId) {
      show('Your session is missing an employee id. Please log in again.', 'error');
      return;
    }
    try {
      setSaving(true);
      const uploaded = await uploadStorageFile({
        file,
        category: 'employee-documents',
        module: 'expense',
        documentType: 'EXPENSE_RECEIPT',
        employeeId,
        expenseClaimId: claimId,
      });
      await updateLine.mutateAsync({
        claimId,
        lineId,
        payload: {
          receipt: {
            documentType: 'EXPENSE_RECEIPT',
            fileName: uploaded.fileName,
            mimeType: uploaded.mimeType,
            sizeBytes: uploaded.sizeBytes,
            storageKey: uploaded.storageKey,
          },
        },
      });
      show('Receipt attached', 'success');
      await claimQuery.refetch();
    } catch (err) {
      show(err?.message || 'Failed to attach receipt', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setSubmitError('');

      if (!assertTitleValid()) return;

      if (addPanelOpen && isLineFormDirty(lineForm)) {
        const saved = await saveExpenseFromForm({
          collapseOnSuccess: true,
          silentSuccess: true,
        });
        if (!saved) return;
      }

      const latest = await claimQuery.refetch();
      const latestLines = latest.data?.lines ?? lines;

      if (!latestLines.length) {
        setAddPanelOpen(true);
        setShowLineValidationAlert(true);
        const errors = validateExpenseLineForm(EMPTY_LINE_FORM, null, {
          requireReceipt: true,
          todayKey,
        });
        setLineErrors(errors);
        focusField(firstErrorField(errors));
        return;
      }

      const withoutReceipt = latestLines.filter((line) => !line.hasReceipt);
      if (withoutReceipt.length) {
        const msg =
          withoutReceipt.length === 1
            ? `Line ${withoutReceipt[0].lineNo} still needs a receipt. Use Attach receipt on that item.`
            : `${withoutReceipt.length} expenses are missing receipts. Use Attach receipt on those items.`;
        setSubmitError(msg);
        show(msg, 'error');
        return;
      }

      const futureMsg = findFutureDatedLineMessage(latestLines, todayKey);
      if (futureMsg) {
        setSubmitError(futureMsg);
        show(futureMsg, 'error');
        return;
      }

      const idToUse = claimId || (await ensureClaim());
      await submitClaim.mutateAsync(idToUse);
      setSubmitError('');
      show('Claim submitted for approval', 'success');
      navigate('/expense/claims');
    } catch (err) {
      const msg = err?.message || 'Failed to submit claim';
      setSubmitError(msg);
      show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && claimQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isNew && claimQuery.isError) {
    return (
      <Alert severity="error">{claimQuery.error?.message || 'Claim not found'}</Alert>
    );
  }

  const formDirty = isLineFormDirty(lineForm);
  const submitDisabled =
    saving ||
    !editable ||
    missingReceiptCount > 0 ||
    (!lines.length && !formDirty);

  let submitHelper = '';
  if (editable) {
    if (!lines.length && !formDirty) {
      submitHelper = 'Add at least one expense to submit';
    } else if (missingReceiptCount > 0) {
      submitHelper =
        'Some expenses are missing receipts. Use Attach receipt on those items.';
    }
  }

  const receiptHasError = Boolean(lineErrors.receipt);
  const receiptBorderColor = receiptHasError
    ? 'error.main'
    : receiptFile
      ? 'success.main'
      : 'divider';

  return (
    <Box>
      <PageHeader
        title={isNew ? 'New expense claim' : `Claim ${claim?.claimNumber || ''}`}
        secondaryActions={
          <Button onClick={() => navigate('/expense/claims')}>Back to list</Button>
        }
      />
      <PageCard sx={{ p: 2, mt: 2 }}>
        <Stack spacing={3}>
          {claim?.sendBackReason && (
            <Alert severity="warning">Sent back: {claim.sendBackReason}</Alert>
          )}
          {claim?.rejectionReason && (
            <Alert severity="error">Rejected: {claim.rejectionReason}</Alert>
          )}

          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Claim details
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                id={FIELD_INPUT_IDS.title}
                label="Title"
                required
                size="small"
                fullWidth
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                disabled={!editable}
                error={Boolean(titleError)}
                helperText={
                  titleError || 'Short name for this claim (min 3 characters)'
                }
              />
              <TextField
                label="Purpose"
                size="small"
                fullWidth
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={!editable}
                helperText="Why these expenses were incurred"
              />
            </Stack>
            {editable && (
              <Button
                variant="outlined"
                onClick={handleSaveHeader}
                disabled={saving}
                sx={{ mt: 2 }}
              >
                Save draft
              </Button>
            )}
          </Box>

          <Divider />

          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h6">Expense items</Typography>
              {editable && !addPanelOpen && (
                <Button variant="contained" onClick={() => setAddPanelOpen(true)}>
                  {lines.length ? 'Add another expense' : 'Add expense'}
                </Button>
              )}
            </Stack>

            {!lines.length && !addPanelOpen && (
              <EmptyStatePanel
                title="No expenses yet"
                description="Add your first expense with a receipt, then submit the claim for approval."
              />
            )}

            <Stack spacing={1.5}>
              {lines.map((line) => (
                <Box
                  key={line.id}
                  sx={{
                    border: '1px solid',
                    borderColor: line.hasReceipt ? 'divider' : 'warning.main',
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Typography fontWeight={600}>
                        #{line.lineNo} · {line.categoryName} · {claim?.currency || 'INR'}{' '}
                        {line.amount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {line.expenseDate} · {line.merchant}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {line.description}
                      </Typography>
                      <Chip
                        size="small"
                        sx={{ mt: 1 }}
                        color={line.hasReceipt ? 'success' : 'warning'}
                        label={line.hasReceipt ? 'Receipt attached' : 'Receipt missing'}
                      />
                    </Box>
                    {editable && (
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Button
                          component="label"
                          size="small"
                          variant={line.hasReceipt ? 'outlined' : 'contained'}
                          disabled={saving}
                        >
                          {line.hasReceipt ? 'Replace receipt' : 'Attach receipt'}
                          <input
                            hidden
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              handleAttachReceiptToLine(line.id, file);
                            }}
                          />
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteLine(line.id)}
                          disabled={saving}
                        >
                          Remove
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>

            {editable && addPanelOpen && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  maxWidth: 720,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Add expense
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  All fields marked * are required
                </Typography>

                {showLineValidationAlert && Object.keys(lineErrors).length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Please fix the highlighted fields
                  </Alert>
                )}

                <Stack spacing={2}>
                  <TextField
                    id={FIELD_INPUT_IDS.categoryId}
                    select
                    required
                    size="small"
                    label="Category"
                    value={lineForm.categoryId}
                    onChange={(e) => updateLineField('categoryId', e.target.value)}
                    error={Boolean(lineErrors.categoryId)}
                    helperText={lineErrors.categoryId || ' '}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    id={FIELD_INPUT_IDS.expenseDate}
                    type="date"
                    required
                    size="small"
                    label="Expense date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: todayKey }}
                    value={lineForm.expenseDate}
                    onChange={(e) => updateLineField('expenseDate', e.target.value)}
                    error={Boolean(lineErrors.expenseDate)}
                    helperText={
                      lineErrors.expenseDate || 'Cannot be a future date'
                    }
                  />
                  <TextField
                    id={FIELD_INPUT_IDS.merchant}
                    required
                    size="small"
                    label="Merchant"
                    value={lineForm.merchant}
                    onChange={(e) => updateLineField('merchant', e.target.value)}
                    error={Boolean(lineErrors.merchant)}
                    helperText={
                      lineErrors.merchant || 'Where you spent (min 2 characters)'
                    }
                  />
                  <TextField
                    id={FIELD_INPUT_IDS.description}
                    required
                    size="small"
                    label="Description"
                    value={lineForm.description}
                    onChange={(e) => updateLineField('description', e.target.value)}
                    error={Boolean(lineErrors.description)}
                    helperText={
                      lineErrors.description ||
                      'What this expense was for (min 3 characters)'
                    }
                  />
                  <TextField
                    id={FIELD_INPUT_IDS.amount}
                    required
                    size="small"
                    label="Amount"
                    value={lineForm.amount}
                    onChange={(e) => updateLineField('amount', e.target.value)}
                    error={Boolean(lineErrors.amount)}
                    helperText={lineErrors.amount || 'Amount greater than zero'}
                  />

                  <Box>
                    <Box
                      component="label"
                      htmlFor={FIELD_INPUT_IDS.receipt}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 1,
                        borderWidth: 1,
                        borderStyle: receiptFile && !receiptHasError ? 'solid' : 'dashed',
                        borderColor: receiptBorderColor,
                        bgcolor: receiptHasError
                          ? 'rgba(211, 47, 47, 0.04)'
                          : receiptFile
                            ? 'rgba(46, 125, 50, 0.04)'
                            : 'action.hover',
                        cursor: 'pointer',
                        '&:hover': { borderColor: receiptHasError ? 'error.main' : 'primary.main' },
                      }}
                    >
                      <InsertDriveFileOutlinedIcon
                        color={
                          receiptHasError ? 'error' : receiptFile ? 'success' : 'action'
                        }
                        fontSize="small"
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {receiptFile
                            ? receiptFile.name
                            : 'Attach receipt (required)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          PDF or image, max 5 MB
                        </Typography>
                      </Box>
                      {receiptFile && (
                        <IconButton
                          size="small"
                          aria-label="Clear receipt"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setReceiptFile(null);
                            if (showAttemptedRef.current) {
                              setLineErrors((prev) => ({
                                ...prev,
                                receipt: 'Receipt is required',
                              }));
                            }
                          }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <input
                        id={FIELD_INPUT_IDS.receipt}
                        hidden
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setReceiptFile(file);
                          if (file) {
                            setLineErrors((prev) => {
                              if (!prev.receipt) return prev;
                              const next = { ...prev };
                              delete next.receipt;
                              return next;
                            });
                          }
                        }}
                      />
                    </Box>
                    {receiptHasError && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
                        {lineErrors.receipt}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handleSaveExpense}
                      disabled={saving}
                    >
                      Save expense
                    </Button>
                    <Button
                      variant="text"
                      onClick={handleCancelAdd}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Total: {claim?.currency || 'INR'} {claim?.totalAmount ?? '0.00'}
              {claim?.status
                ? ` · Status: ${claim.status.replace(/_/g, ' ')}`
                : ''}
            </Typography>
            {editable && (
              <Stack spacing={1} sx={{ mt: 1.5 }} alignItems="flex-start">
                {submitError ? (
                  <Alert
                    severity="error"
                    onClose={() => setSubmitError('')}
                    sx={{ width: '100%', maxWidth: 560 }}
                  >
                    {submitError}
                  </Alert>
                ) : null}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                >
                  Submit for approval
                </Button>
                {submitHelper ? (
                  <Typography variant="body2" color="text.secondary">
                    {submitHelper}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Your manager will review this claim, then finance will settle it.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </PageCard>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Box>
  );
}
