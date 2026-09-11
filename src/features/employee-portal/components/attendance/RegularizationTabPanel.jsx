import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { EmptyStatePanel } from '../EmptyStatePanel';
import { PageCard } from '@/shared/components/ui/PageCard';
import { RegularizationApplyForm } from './RegularizationApplyForm';
import { RegularizationRequestCard } from './RegularizationRequestCard';
import { useRegularizationApplyForm } from '../../hooks/useRegularizationApplyForm';
import {
  useAttendanceRegularization,
  useSubmitAttendanceRegularization,
  useWithdrawAttendanceRegularization,
} from '../../hooks/useEmployeePortalQueries';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';

/**
 * @param {{ initialDate?: string }} props
 */
export function RegularizationTabPanel({ initialDate }) {
  const form = useRegularizationApplyForm(initialDate);
  const { snackbar, show, close } = useAppSnackbar();
  const listQuery = useAttendanceRegularization();
  const submitMutation = useSubmitAttendanceRegularization();
  const withdrawMutation = useWithdrawAttendanceRegularization();

  useEffect(() => {
    if (initialDate) {
      form.setValue('workDate', initialDate, { shouldValidate: true });
    }
  }, [initialDate, form]);

  const handleSubmit = async (values) => {
    try {
      await submitMutation.mutateAsync(values);
      show('Regularization request submitted');
      form.reset({ workDate: '', inTime: '', outTime: '', reason: '' });
    } catch (e) {
      show(e?.message ?? 'Failed to submit regularization request', 'error');
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await withdrawMutation.mutateAsync(id);
      show('Regularization request withdrawn');
    } catch (e) {
      show(e?.message ?? 'Failed to withdraw', 'error');
    }
  };

  const items = listQuery.data?.items ?? [];

  return (
    <>
      <PageCard sx={{ width: '100%', minWidth: 0, p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <RegularizationApplyForm
          form={form}
          hasAssignedManager={Boolean(listQuery.data?.hasAssignedManager)}
          approverName={listQuery.data?.approver?.name}
          onSubmit={handleSubmit}
          submitting={submitMutation.isPending}
        />
      </PageCard>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Your requests
      </Typography>

      {listQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : listQuery.error ? (
        <Alert severity="error">{listQuery.error.message}</Alert>
      ) : items.length === 0 ? (
        <EmptyStatePanel
          title="No regularization requests"
          description="Submitted requests and manager decisions will appear here."
        />
      ) : (
        <Stack>
          {items.map((req) => (
            <RegularizationRequestCard
              key={req.id}
              request={req}
              onWithdraw={handleWithdraw}
              withdrawing={withdrawMutation.isPending}
            />
          ))}
        </Stack>
      )}

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </>
  );
}
