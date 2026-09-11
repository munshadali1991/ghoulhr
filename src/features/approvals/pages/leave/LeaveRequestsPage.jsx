import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import { SegmentedTabs } from '@/features/employee-portal/components/SegmentedTabs';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { LeaveRequestListItem } from '../../components/LeaveRequestListItem';
import { LeaveApprovalDetailPanel } from '../../components/LeaveApprovalDetailPanel';
import { RegularizationRequestListItem } from '../../components/RegularizationRequestListItem';
import { RegularizationApprovalDetailPanel } from '../../components/RegularizationApprovalDetailPanel';
import {
  usePendingLeaveApprovals,
  usePendingRegularizationApprovals,
} from '../../hooks/useApprovalsQueries';

export function LeaveRequestsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = useAuthorization();
  const { snackbar, show, close } = useAppSnackbar();

  const canLeave = can('approvals.leave:read');
  const canRegularization = can('approvals.attendance:read');

  const requestedTab = searchParams.get('tab');
  const tab =
    requestedTab === 'regularization' && canRegularization
      ? 'regularization'
      : canLeave
        ? 'leave'
        : 'regularization';

  const leaveQuery = usePendingLeaveApprovals(canLeave);
  const regularizationQuery = usePendingRegularizationApprovals(canRegularization);

  const pendingQuery = tab === 'regularization' ? regularizationQuery : leaveQuery;
  const items = pendingQuery.data ?? [];

  const [selectedId, setSelectedId] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const tabOptions = [
    ...(canLeave ? [{ value: 'leave', label: 'Leave Requests' }] : []),
    ...(canRegularization ? [{ value: 'regularization', label: 'Regularization Requests' }] : []),
  ];

  const setTab = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'leave') {
      next.delete('tab');
    } else {
      next.set('tab', value);
    }
    setSearchParams(next);
    setSelectedId(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const handleActionComplete = () => {
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const leaveDetail = selectedId ? (
    <LeaveApprovalDetailPanel
      key={selectedId}
      requestId={selectedId}
      onActionComplete={handleActionComplete}
      onSuccess={show}
      onError={(msg) => show(msg, 'error')}
    />
  ) : (
    <EmptyStatePanel
      title="Select a leave request"
      description="Choose a pending request from the list to review details."
    />
  );

  const regularizationDetail = selectedId ? (
    <RegularizationApprovalDetailPanel
      key={selectedId}
      requestId={selectedId}
      onActionComplete={handleActionComplete}
      onSuccess={show}
      onError={(msg) => show(msg, 'error')}
    />
  ) : (
    <EmptyStatePanel
      title="Select a regularization request"
      description="Choose a pending request from the list to review in and out times."
    />
  );

  const detailPanel = tab === 'regularization' ? regularizationDetail : leaveDetail;

  const emptyTitle =
    tab === 'regularization'
      ? 'No regularization requests awaiting approval'
      : 'No leave requests awaiting approval';
  const emptyDescription =
    tab === 'regularization'
      ? 'When your team members submit forgotten check-in or check-out requests, they will appear here.'
      : 'When your team members apply for leave, their requests will appear here.';

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {tab === 'regularization' ? 'Regularization Requests' : 'Leave Requests'}
        </Typography>

        {tabOptions.length > 1 ? (
          <Box sx={{ mb: 3 }}>
            <SegmentedTabs value={tab} options={tabOptions} onChange={setTab} />
          </Box>
        ) : null}

        {pendingQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : pendingQuery.error ? (
          <Alert severity="error">{pendingQuery.error.message}</Alert>
        ) : items.length === 0 ? (
          <EmptyStatePanel title={emptyTitle} description={emptyDescription} />
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ maxHeight: { md: 'calc(100vh - 200px)' }, overflowY: 'auto', pr: { md: 0.5 } }}>
                {tab === 'regularization'
                  ? items.map((req) => (
                      <RegularizationRequestListItem
                        key={req.id}
                        request={req}
                        selected={req.id === selectedId}
                        onSelect={() => handleSelect(req.id)}
                      />
                    ))
                  : items.map((req) => (
                      <LeaveRequestListItem
                        key={req.id}
                        request={req}
                        selected={req.id === selectedId}
                        onSelect={() => handleSelect(req.id)}
                      />
                    ))}
              </Box>
            </Grid>

            {!isMobile ? (
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ position: { md: 'sticky' }, top: 16 }}>{detailPanel}</Box>
              </Grid>
            ) : null}
          </Grid>
        )}
      </Box>

      <Drawer
        anchor="bottom"
        open={isMobile && mobileDrawerOpen && Boolean(selectedId)}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '92vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
          },
        }}
      >
        {selectedId && tab === 'regularization' ? (
          <RegularizationApprovalDetailPanel
            key={selectedId}
            requestId={selectedId}
            onActionComplete={() => {
              setMobileDrawerOpen(false);
              handleActionComplete();
            }}
            onSuccess={show}
            onError={(msg) => show(msg, 'error')}
          />
        ) : selectedId ? (
          <LeaveApprovalDetailPanel
            key={selectedId}
            requestId={selectedId}
            onActionComplete={() => {
              setMobileDrawerOpen(false);
              handleActionComplete();
            }}
            onSuccess={show}
            onError={(msg) => show(msg, 'error')}
          />
        ) : null}
      </Drawer>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </>
  );
}
