import { useState } from 'react';
import { Alert, Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PRIORITIES, TASK_STATUSES } from '@/features/employee-portal/constants/timesheetEnums';
import { TimesheetStatusChip } from '@/features/employee-portal/components/timesheet/TimesheetStatusChip';
import {
  useApproveTimesheet,
  useRejectTimesheet,
  useTimesheetApprovalDetail,
} from '../hooks/useApprovalsQueries';
import { EmployeeIdentitySection } from './EmployeeIdentitySection';
import { TimesheetEntriesReviewTable } from './TimesheetEntriesReviewTable';
import { TimesheetApprovalActionBar } from './TimesheetApprovalActionBar';
import { ApproveTimesheetDialog } from './ApproveTimesheetDialog';
import { RejectTimesheetDialog } from './RejectTimesheetDialog';

/**
 * @param {{
 *   requestId: string,
 *   onActionComplete?: () => void,
 *   onError?: (message: string) => void,
 *   onSuccess?: (message: string) => void,
 * }} props
 */
export function TimesheetApprovalDetailPanel({
  requestId,
  onActionComplete,
  onError,
  onSuccess,
}) {
  const detailQuery = useTimesheetApprovalDetail(requestId);
  const approveMutation = useApproveTimesheet();
  const rejectMutation = useRejectTimesheet();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const acting = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ id: requestId });
      setApproveOpen(false);
      onSuccess?.('Timesheet approved');
      onActionComplete?.();
    } catch (e) {
      onError?.(e?.message ?? 'Failed to approve timesheet');
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectMutation.mutateAsync({ id: requestId, reason });
      setRejectOpen(false);
      onSuccess?.('Timesheet rejected');
      onActionComplete?.();
    } catch (e) {
      onError?.(e?.message ?? 'Failed to reject timesheet');
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

  const { day } = data;

  return (
    <>
      <PageCard sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2.5} divider={<Divider flexItem />}>
          <EmployeeIdentitySection employee={data.employee} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Day summary
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <SummaryField
                label="Work date"
                value={dayjs(day.workDate).format('DD MMM YYYY')}
              />
              <SummaryField
                label="Total hours"
                value={`${Number(day.totalHours).toFixed(1)}h`}
              />
              <SummaryField
                label="Status"
                value={<TimesheetStatusChip status={day.status} />}
              />
              <SummaryField
                label="Submitted"
                value={day.submittedAt ? dayjs(day.submittedAt).format('DD MMM YYYY, HH:mm') : '—'}
              />
              {day.approvedAt ? (
                <SummaryField
                  label="Approved"
                  value={dayjs(day.approvedAt).format('DD MMM YYYY, HH:mm')}
                />
              ) : null}
              {day.rejectedAt ? (
                <SummaryField
                  label="Rejected"
                  value={dayjs(day.rejectedAt).format('DD MMM YYYY, HH:mm')}
                />
              ) : null}
              {day.rejectionReason ? (
                <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                  <SummaryField label="Rejection reason" value={day.rejectionReason} />
                </Box>
              ) : null}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Entries
            </Typography>
            <TimesheetEntriesReviewTable
              entries={day.entries ?? []}
              taskStatuses={TASK_STATUSES}
              priorities={PRIORITIES}
            />
          </Box>
          {data.canAct ? (
            <TimesheetApprovalActionBar
              disabled={acting}
              onApprove={() => setApproveOpen(true)}
              onReject={() => setRejectOpen(true)}
            />
          ) : null}
        </Stack>
      </PageCard>

      <ApproveTimesheetDialog
        open={approveOpen}
        employeeName={data.employee.name}
        workDate={dayjs(day.workDate).format('DD MMM YYYY')}
        isPending={acting}
        onConfirm={handleApprove}
        onCancel={() => setApproveOpen(false)}
      />

      <RejectTimesheetDialog
        open={rejectOpen}
        employeeName={data.employee.name}
        isPending={acting}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </>
  );
}

/**
 * @param {{ label: string, value: import('react').ReactNode }} props
 */
function SummaryField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ) : (
        <Box sx={{ mt: 0.25 }}>{value}</Box>
      )}
    </Box>
  );
}
