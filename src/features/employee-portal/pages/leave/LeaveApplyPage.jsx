import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { PageCard } from '@/shared/components/ui/PageCard';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { LeaveTypeNav } from '../../components/LeaveTypeNav';
import { LeaveApplyForm } from '../../components/LeaveApplyForm';
import { LeaveRequestAccordionCard } from '../../components/LeaveRequestAccordionCard';
import { EmptyStatePanel } from '../../components/EmptyStatePanel';
import { useLeaveApplyForm } from '../../hooks/useLeaveApplyForm';
import {
  useLeaveRequests,
  useLeaveTypes,
  useSubmitLeaveRequest,
  useWithdrawLeaveRequest,
} from '../../hooks/useEmployeePortalQueries';

const TAB_OPTIONS = [
  { value: 'apply', label: 'Apply' },
  { value: 'pending', label: 'Pending' },
  { value: 'history', label: 'History' },
];

export function LeaveApplyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'apply';
  const [leaveTypeNav, setLeaveTypeNav] = useState('leave');
  const { snackbar, show, close } = useAppSnackbar();

  const form = useLeaveApplyForm();
  const fromDateParam = searchParams.get('fromDate');
  const toDateParam = searchParams.get('toDate');

  useEffect(() => {
    if (fromDateParam && dayjs(fromDateParam).isValid()) {
      form.setValue('fromDate', fromDateParam, { shouldValidate: true });
    }
    if (toDateParam && dayjs(toDateParam).isValid()) {
      form.setValue('toDate', toDateParam, { shouldValidate: true });
    }
  }, [fromDateParam, toDateParam, form]);

  const { data: typesData, isLoading: typesLoading } = useLeaveTypes();
  const submitMutation = useSubmitLeaveRequest();
  const withdrawMutation = useWithdrawLeaveRequest();

  const pendingQuery = useLeaveRequests('PENDING');
  const approvedHistoryQuery = useLeaveRequests('APPROVED');
  const rejectedHistoryQuery = useLeaveRequests('REJECTED');

  const historyItems = [...(approvedHistoryQuery.data ?? []), ...(rejectedHistoryQuery.data ?? [])].sort(
    (a, b) => dayjs(b.appliedOn).valueOf() - dayjs(a.appliedOn).valueOf(),
  );
  const historyLoading = approvedHistoryQuery.isLoading || rejectedHistoryQuery.isLoading;
  const historyError = approvedHistoryQuery.error ?? rejectedHistoryQuery.error;

  const setTab = (value) => {
    setSearchParams({ tab: value });
  };

  const handleSubmit = async (values) => {
    const typeLabel = typesData?.types?.find((t) => t.value === values.leaveType)?.label;
    const approverLabel = typesData?.approvers?.find((a) => a.value === values.applyingTo)?.label;
    try {
      await submitMutation.mutateAsync({
        ...values,
        leaveTypeLabel: typeLabel,
        approverLabel,
      });
      show('Leave request submitted successfully');
      form.reset();
      const firstApprover = typesData?.approvers?.[0]?.value;
      if (firstApprover) {
        form.setValue('applyingTo', firstApprover, { shouldValidate: true });
      }
      setTab('pending');
    } catch (e) {
      show(e?.message ?? 'Failed to submit leave request', 'error');
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await withdrawMutation.mutateAsync(id);
      show('Leave request withdrawn');
    } catch (e) {
      show(e?.message ?? 'Failed to withdraw', 'error');
    }
  };

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <Box sx={{ width: '100%', mb: 3 }}>
          <SegmentedTabs value={tab} options={TAB_OPTIONS} onChange={setTab} />
        </Box>

      {tab === 'apply' && (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="flex-start"
          sx={{ width: '100%', minWidth: 0 }}
        >
          <Box sx={{ width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
            <LeaveTypeNav value={leaveTypeNav} onChange={setLeaveTypeNav} />
          </Box>
          <PageCard sx={{ flex: 1, width: '100%', minWidth: 0, p: { xs: 1.5, sm: 2, md: 3 } }}>
            {typesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <LeaveApplyForm
                form={form}
                leaveTypes={typesData?.types ?? []}
                approvers={typesData?.approvers ?? []}
                rules={typesData?.rules ?? []}
                onSubmit={handleSubmit}
                submitting={submitMutation.isPending}
              />
            )}
          </PageCard>
        </Stack>
      )}

      {tab === 'pending' && (
        <Box>
          {pendingQuery.isLoading ? (
            <CircularProgress size={32} />
          ) : pendingQuery.error ? (
            <Alert severity="error">{pendingQuery.error.message}</Alert>
          ) : pendingQuery.data?.length === 0 ? (
            <EmptyStatePanel title="No pending leave requests" />
          ) : (
            pendingQuery.data.map((req) => (
              <LeaveRequestAccordionCard
                key={req.id}
                request={req}
                mode="pending"
                onWithdraw={handleWithdraw}
                withdrawing={withdrawMutation.isPending}
              />
            ))
          )}
        </Box>
      )}

      {tab === 'history' && (
        <Box>
          {historyLoading ? (
            <CircularProgress size={32} />
          ) : historyError ? (
            <Alert severity="error">{historyError.message}</Alert>
          ) : historyItems.length === 0 ? (
            <EmptyStatePanel title="No leave history" />
          ) : (
            historyItems.map((req) => (
              <LeaveRequestAccordionCard key={req.id} request={req} mode="history" />
            ))
          )}
        </Box>
      )}

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
      </Box>
    </>
  );
}
