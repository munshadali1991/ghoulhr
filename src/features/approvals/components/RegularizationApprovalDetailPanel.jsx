import { useState } from 'react';
import { Alert, Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import {
  useApproveRegularizationRequest,
  useRegularizationApprovalDetail,
  useRejectRegularizationRequest,
} from '../hooks/useApprovalsQueries';
import { EmployeeIdentitySection } from './EmployeeIdentitySection';
import { ApprovalActionBar } from './ApprovalActionBar';
import { ApproveLeaveDialog } from './ApproveLeaveDialog';
import { RejectLeaveDialog } from './RejectLeaveDialog';

/**
 * @param {{
 *   requestId: string,
 *   onActionComplete?: () => void,
 *   onError?: (message: string) => void,
 *   onSuccess?: (message: string) => void,
 * }} props
 */
export function RegularizationApprovalDetailPanel({
  requestId,
  onActionComplete,
  onError,
  onSuccess,
}) {
  const detailQuery = useRegularizationApprovalDetail(requestId);
  const approveMutation = useApproveRegularizationRequest();
  const rejectMutation = useRejectRegularizationRequest();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const acting = approveMutation.isPending || rejectMutation.isPending;
  const detail = detailQuery.data;

  const handleApprove = async (notes) => {
    try {
      await approveMutation.mutateAsync({ id: requestId, notes });
      setApproveOpen(false);
      onSuccess?.('Regularization request approved');
      onActionComplete?.();
    } catch (e) {
      onError?.(e?.message ?? 'Failed to approve regularization request');
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectMutation.mutateAsync({ id: requestId, reason });
      setRejectOpen(false);
      onSuccess?.('Regularization request rejected');
      onActionComplete?.();
    } catch (e) {
      onError?.(e?.message ?? 'Failed to reject regularization request');
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
    return <Alert severity="error">{detailQuery.error.message}</Alert>;
  }

  if (!detail) {
    return null;
  }

  return (
    <PageCard sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={700}>
          Regularization request
        </Typography>
        <EmployeeIdentitySection employee={detail.employee} />
        <Divider />
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Requested times
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            <Field label="Work date" value={detail.workDate} />
            <Field label="Applied on" value={detail.appliedOn} />
            <Field label="Requested in" value={detail.inTime ?? '—'} />
            <Field label="Requested out" value={detail.outTime ?? '—'} />
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Reason
          </Typography>
          <Typography variant="body2">{detail.reason || '—'}</Typography>
        </Box>
        {detail.currentAttendance ? (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Current attendance
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 1.5,
              }}
            >
              <Field label="Status" value={detail.currentAttendance.status ?? '—'} />
              <Field label="First in" value={detail.currentAttendance.firstIn ?? '—'} />
              <Field label="Last out" value={detail.currentAttendance.lastOut ?? '—'} />
            </Box>
          </Box>
        ) : null}
        <ApprovalActionBar
          permission="approvals.attendance:act"
          showSendBack={false}
          onApprove={() => setApproveOpen(true)}
          onSendBack={() => {}}
          onReject={() => setRejectOpen(true)}
          disabled={acting}
        />
      </Stack>

      <ApproveLeaveDialog
        open={approveOpen}
        employeeName={detail.employee?.name}
        leaveType="regularization"
        isPending={approveMutation.isPending}
        onConfirm={handleApprove}
        onCancel={() => setApproveOpen(false)}
      />
      <RejectLeaveDialog
        open={rejectOpen}
        employeeName={detail.employee?.name}
        isPending={rejectMutation.isPending}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </PageCard>
  );
}

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
