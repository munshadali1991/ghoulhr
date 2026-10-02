import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuth } from '@/app/providers/useAuth';
import { uploadStorageFile } from '@/shared/api/storageApi';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { ExpenseClaimActions } from '../components/ExpenseClaimActions';
import { ExpenseInlineLineRow } from '../components/ExpenseInlineLineRow';
import { ExpenseSavedLinesTable } from '../components/ExpenseSavedLinesTable';
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
      setAddPanelOpen(lineCount === 0 && EDITABLE.has(claim.status));
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

  const handleReceiptChange = (file) => {
    setReceiptFile(file);
    if (file) {
      setLineErrors((prev) => {
        if (!prev.receipt) return prev;
        const next = { ...prev };
        delete next.receipt;
        return next;
      });
    } else if (showAttemptedRef.current) {
      setLineErrors((prev) => ({
        ...prev,
        receipt: 'Receipt is required',
      }));
    }
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

  const handleAddRow = () => {
    resetLineForm();
    setAddPanelOpen(true);
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
  const canSubmit =
    editable &&
    !saving &&
    missingReceiptCount === 0 &&
    (lines.length > 0 || formDirty);

  let submitHelper =
    'Your manager will review this claim, then finance will settle it.';
  if (editable) {
    if (!lines.length && !formDirty) {
      submitHelper = 'Add at least one expense to submit';
    } else if (missingReceiptCount > 0) {
      submitHelper =
        'Some expenses are missing receipts. Use Attach receipt on those items.';
    }
  }

  const currency = claim?.currency || 'INR';
  const summaryCountLabel = `${lines.length} expense(s) · ${currency} ${claim?.totalAmount ?? '0.00'}`;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {isNew ? 'New expense claim' : `Claim ${claim?.claimNumber || ''}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill claim details, add expenses with receipts, then submit for approval.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignSelf: { sm: 'flex-start' } }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => claimQuery.refetch()}
            disabled={isNew || claimQuery.isFetching}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/expense/claims')}
          >
            Back to list
          </Button>
        </Stack>
      </Box>

      {claim?.sendBackReason ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Sent back: {claim.sendBackReason}
        </Alert>
      ) : null}
      {claim?.rejectionReason ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Rejected: {claim.rejectionReason}
        </Alert>
      ) : null}

      <PageCard sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            {missingReceiptCount > 0 ? (
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                {missingReceiptCount} missing receipt(s)
              </Typography>
            ) : (
              <Box />
            )}
            <Typography variant="body2" fontWeight={600}>
              {summaryCountLabel}
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-start' }}>
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
              helperText={titleError || 'Short name for this claim (min 3 characters)'}
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
        </CardContent>
      </PageCard>

      {editable ? (
        <PageCard sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              New expense
            </Typography>

            {showLineValidationAlert && Object.keys(lineErrors).length > 0 ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Please fix the highlighted fields
              </Alert>
            ) : null}

            {addPanelOpen ? (
              <ExpenseInlineLineRow
                value={lineForm}
                onChange={updateLineField}
                errors={lineErrors}
                receiptFile={receiptFile}
                onReceiptChange={handleReceiptChange}
                fieldIds={FIELD_INPUT_IDS}
                todayKey={todayKey}
                categories={categories}
                onSave={handleSaveExpense}
                onAdd={handleAddRow}
                addLabel="Add expense"
                saving={saving}
                showActions={false}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Use + to add another expense after saving.
              </Typography>
            )}

            <ExpenseInlineLineRow
              actionsOnly
              value={lineForm}
              onChange={updateLineField}
              onSave={handleSaveExpense}
              onAdd={handleAddRow}
              addLabel="Add expense"
              saving={saving}
            />

            {submitError ? (
              <Alert
                severity="error"
                onClose={() => setSubmitError('')}
                sx={{ mt: 2 }}
              >
                {submitError}
              </Alert>
            ) : null}

            <ExpenseClaimActions
              editable={editable}
              isSaving={saving}
              canSubmit={canSubmit}
              onSubmit={handleSubmit}
              helperText={submitHelper}
            />
          </CardContent>
        </PageCard>
      ) : null}

      <PageCard>
        <ExpenseSavedLinesTable
          lines={lines}
          currency={currency}
          isLoading={!isNew && claimQuery.isLoading}
          error={!isNew && claimQuery.isError ? claimQuery.error : null}
          isEditable={Boolean(editable)}
          saving={saving}
          onAttachReceipt={handleAttachReceiptToLine}
          onDelete={handleDeleteLine}
        />
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
