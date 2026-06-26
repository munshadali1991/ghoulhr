import { useState } from 'react';
import { Alert, Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { downloadBase64File } from '../api/approvalsApi';
import {
  useApproveLeaveRequest,
  useDownloadLeaveDocument,
  useLeaveApprovalDetail,
  useRejectLeaveRequest,
} from '../hooks/useApprovalsQueries';
import { EmployeeIdentitySection } from './EmployeeIdentitySection';
import { LeaveRequestDetailsSection } from './LeaveRequestDetailsSection';
import { BalanceSnapshotSection } from './BalanceSnapshotSection';
import { LeaveHistoryTable } from './LeaveHistoryTable';
import { TeamCoverageSection } from './TeamCoverageSection';
import { AttachmentSection } from './AttachmentSection';
import { WorkflowStatusStepper } from './WorkflowStatusStepper';
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
export function LeaveApprovalDetailPanel({
  requestId,
  onActionComplete,
  onError,
  onSuccess,
}) {
  const detailQuery = useLeaveApprovalDetail(requestId);
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();
  const downloadMutation = useDownloadLeaveDocument();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState('reject');

  const acting = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async (notes) => {
    try {
      await approveMutation.mutateAsync({ id: requestId, notes });
      setApproveOpen(false);
      onSuccess?.('Leave request approved');
      onActionComplete?.();
    } catch (e) {
      onError?.(e?.message ?? 'Failed to approve leave request');
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectMutation.mutateAsync({ id: requestId, reason });
      setRejectOpen(false);
      onSuccess?.(rejectMode === 'sendBack' ? 'Leave request sent back' : 'Leave request rejected');
      onActionComplete?.();
    } catch (e) {
      onError?.(e?.message ?? 'Failed to update leave request');
    }
  };

  const handleDownload = async () => {
    try {
      const file = await downloadMutation.mutateAsync(requestId);
      downloadBase64File(file);
    } catch (e) {
      onError?.(e?.message ?? 'Failed to download document');
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

  const data = detailQuery.data;
  if (!data) return null;

  return (
    <>
      <PageCard sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2.5} divider={<Divider flexItem />}>
          <EmployeeIdentitySection employee={data.employee} />
          <LeaveRequestDetailsSection request={data.request} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Workflow
            </Typography>
            <WorkflowStatusStepper workflow={data.workflow} />
          </Box>
          <BalanceSnapshotSection
            balanceSnapshot={data.balanceSnapshot}
            allBalances={data.allBalances}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Leave history
            </Typography>
            <LeaveHistoryTable history={data.history} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Team coverage
            </Typography>
            <TeamCoverageSection teamCoverage={data.teamCoverage} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Attachments
            </Typography>
            <AttachmentSection
              document={data.supportingDocument}
              onDownload={handleDownload}
              downloading={downloadMutation.isPending}
            />
          </Box>
          <ApprovalActionBar
            disabled={acting}
            onApprove={() => setApproveOpen(true)}
            onSendBack={() => {
              setRejectMode('sendBack');
              setRejectOpen(true);
            }}
            onReject={() => {
              setRejectMode('reject');
              setRejectOpen(true);
            }}
          />
        </Stack>
      </PageCard>

      <ApproveLeaveDialog
        open={approveOpen}
        employeeName={data.employee.name}
        leaveType={data.request.leaveType}
        isPending={acting}
        onConfirm={handleApprove}
        onCancel={() => setApproveOpen(false)}
      />

      <RejectLeaveDialog
        open={rejectOpen}
        mode={rejectMode}
        employeeName={data.employee.name}
        isPending={acting}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </>
  );
}
