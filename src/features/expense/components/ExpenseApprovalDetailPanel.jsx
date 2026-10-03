import { useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { downloadStoredFile } from '@/shared/api/storageApi';
import { EmployeeIdentitySection } from '@/features/approvals/components/EmployeeIdentitySection';
import { ApprovalActionBar } from '@/features/approvals/components/ApprovalActionBar';
import {
  useExpenseApprovalDetail,
  useManagerExpenseActions,
  useManagerExpenseReceipt,
} from '../hooks/useExpenseQueries';
import { ExpenseClaimSummarySection } from './ExpenseClaimSummarySection';
import { ExpenseLineItemsSection } from './ExpenseLineItemsSection';
import { ExpenseReceiptPreviewDialog } from './ExpenseReceiptPreviewDialog';
import { ApproveExpenseDialog } from './ApproveExpenseDialog';
import { RejectExpenseDialog } from './RejectExpenseDialog';

/**
 * @param {{
 *   claimId: string,
 *   onActionComplete?: () => void,
 *   onError?: (message: string) => void,
 *   onSuccess?: (message: string) => void,
 * }} props
 */
export function ExpenseApprovalDetailPanel({
  claimId,
  onActionComplete,
  onError,
  onSuccess,
}) {
  const detailQuery = useExpenseApprovalDetail(claimId, Boolean(claimId));
  const actions = useManagerExpenseActions();
  const receiptMutation = useManagerExpenseReceipt();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState('reject');
  const [actionError, setActionError] = useState('');
  const [preview, setPreview] = useState({
    open: false,
    lineId: null,
    fileName: '',
  });
  const [receiptBusyLineId, setReceiptBusyLineId] = useState(null);

  const acting =
    actions.approve.isPending ||
    actions.reject.isPending ||
    actions.sendBack.isPending;

  const handleApprove = async (notes) => {
    setActionError('');
    try {
      await actions.approve.mutateAsync({ id: claimId, notes });
      setApproveOpen(false);
      onSuccess?.('Approved — sent to finance');
      onActionComplete?.();
    } catch (e) {
      const msg = e?.message ?? 'Failed to approve claim';
      setActionError(msg);
      onError?.(msg);
    }
  };

  const handleRejectOrSendBack = async (reason) => {
    setActionError('');
    try {
      if (rejectMode === 'sendBack') {
        await actions.sendBack.mutateAsync({ id: claimId, reason });
        onSuccess?.('Sent back to employee');
      } else {
        await actions.reject.mutateAsync({ id: claimId, reason });
        onSuccess?.('Rejected');
      }
      setRejectOpen(false);
      onActionComplete?.();
    } catch (e) {
      const msg = e?.message ?? 'Failed to update claim';
      setActionError(msg);
      onError?.(msg);
    }
  };

  const handleDownloadReceipt = async (line) => {
    try {
      setReceiptBusyLineId(line.id);
      const file = await receiptMutation.mutateAsync({
        claimId,
        lineId: line.id,
      });
      downloadStoredFile(file);
    } catch (e) {
      const msg = e?.message ?? 'Failed to download receipt';
      setActionError(msg);
      onError?.(msg);
    } finally {
      setReceiptBusyLineId(null);
    }
  };

  if (detailQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (detailQuery.error) {
    return (
      <Alert severity="error">
        {detailQuery.error?.message || 'Failed to load claim'}
      </Alert>
    );
  }

  const data = detailQuery.data;
  if (!data) return null;

  const employee = data.employee || {
    id: '',
    name: 'Employee',
    employeeCode: undefined,
    departmentName: undefined,
    designationName: undefined,
  };

  return (
    <>
      <PageCard sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2.5} divider={<Divider flexItem />}>
          {actionError ? (
            <Alert severity="error" onClose={() => setActionError('')}>
              {actionError}
            </Alert>
          ) : null}
          <EmployeeIdentitySection employee={employee} />
          <ExpenseClaimSummarySection claim={data} />
          <ExpenseLineItemsSection
            lines={data.lines || []}
            currency={data.currency}
            onPreviewReceipt={(line) =>
              setPreview({
                open: true,
                lineId: line.id,
                fileName: line.receiptFileName || '',
              })
            }
            onDownloadReceipt={handleDownloadReceipt}
            receiptBusyLineId={receiptBusyLineId}
          />
          <ApprovalActionBar
            permission="approvals.expense:act"
            disabled={acting}
            onApprove={() => {
              setActionError('');
              setApproveOpen(true);
            }}
            onSendBack={() => {
              setActionError('');
              setRejectMode('sendBack');
              setRejectOpen(true);
            }}
            onReject={() => {
              setActionError('');
              setRejectMode('reject');
              setRejectOpen(true);
            }}
          />
        </Stack>
      </PageCard>

      <ApproveExpenseDialog
        open={approveOpen}
        employeeName={employee.name}
        claimNumber={data.claimNumber}
        isPending={acting}
        onConfirm={handleApprove}
        onCancel={() => setApproveOpen(false)}
      />

      <RejectExpenseDialog
        open={rejectOpen}
        mode={rejectMode}
        employeeName={employee.name}
        isPending={acting}
        onConfirm={handleRejectOrSendBack}
        onCancel={() => setRejectOpen(false)}
      />

      <ExpenseReceiptPreviewDialog
        open={preview.open}
        claimId={claimId}
        lineId={preview.lineId}
        fileNameHint={preview.fileName}
        onClose={() => setPreview({ open: false, lineId: null, fileName: '' })}
      />
    </>
  );
}
