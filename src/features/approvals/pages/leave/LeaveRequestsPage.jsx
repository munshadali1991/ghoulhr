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
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import { LeaveRequestListItem } from '../../components/LeaveRequestListItem';
import { LeaveApprovalDetailPanel } from '../../components/LeaveApprovalDetailPanel';
import { usePendingLeaveApprovals } from '../../hooks/useApprovalsQueries';

export function LeaveRequestsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { snackbar, show, close } = useAppSnackbar();

  const pendingQuery = usePendingLeaveApprovals();
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const items = pendingQuery.data ?? [];

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

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

  const detailPanel = selectedId ? (
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

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Leave Requests
        </Typography>

        {pendingQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : pendingQuery.error ? (
          <Alert severity="error">{pendingQuery.error.message}</Alert>
        ) : items.length === 0 ? (
          <EmptyStatePanel
            title="No leave requests awaiting approval"
            description="When your team members apply for leave, their requests will appear here."
          />
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ maxHeight: { md: 'calc(100vh - 200px)' }, overflowY: 'auto', pr: { md: 0.5 } }}>
                {items.map((req) => (
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
                <Box sx={{ position: { md: 'sticky' }, top: 16 }}>
                  {detailPanel}
                </Box>
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
        {selectedId ? (
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
