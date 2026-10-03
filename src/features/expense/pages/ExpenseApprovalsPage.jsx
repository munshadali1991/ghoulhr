import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Drawer,
  Stack,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { usePendingExpenseApprovals } from '../hooks/useExpenseQueries';
import { ExpenseApprovalDetailPanel } from '../components/ExpenseApprovalDetailPanel';
import { ExpenseApprovalInboxToolbar } from '../components/ExpenseApprovalInboxToolbar';
import { ExpenseApprovalClaimsTable } from '../components/ExpenseApprovalClaimsTable';

/**
 * @param {Array<object>} items
 * @param {string} search
 * @param {string} sort
 */
function filterAndSortClaims(items, search, sort) {
  const q = search.trim().toLowerCase();
  let next = items;
  if (q) {
    next = items.filter((item) => {
      const hay = [
        item.claimNumber,
        item.employeeName,
        item.employeeCode,
        item.departmentName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  const sorted = [...next];
  sorted.sort((a, b) => {
    if (sort === 'oldest') {
      return (
        new Date(a.submittedAt || 0).getTime() -
        new Date(b.submittedAt || 0).getTime()
      );
    }
    if (sort === 'amount_desc') {
      return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
    }
    if (sort === 'amount_asc') {
      return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
    }
    // newest (default)
    return (
      new Date(b.submittedAt || 0).getTime() -
      new Date(a.submittedAt || 0).getTime()
    );
  });
  return sorted;
}

export function ExpenseApprovalsPage() {
  const pendingQuery = usePendingExpenseApprovals();
  const items = pendingQuery.data ?? [];
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const { snackbar, show, close } = useAppSnackbar();

  const filteredItems = useMemo(
    () => filterAndSortClaims(items, search, sort),
    [items, search, sort],
  );

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedId(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  return (
    <Box>
      <PageHeader
        title="Expense approvals"
        secondaryActions={
          items.length > 0 ? (
            <Chip
              size="small"
              color="warning"
              label={`${items.length} pending`}
            />
          ) : null
        }
      />

      {pendingQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {pendingQuery.isError && (
        <Alert severity="error">
          {pendingQuery.error?.message || 'Failed to load'}
        </Alert>
      )}
      {!pendingQuery.isLoading && items.length === 0 && (
        <EmptyStatePanel
          title="No pending expense claims"
          description="Claims submitted by your team will appear here."
        />
      )}

      {items.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <ExpenseApprovalInboxToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
          />
          {filteredItems.length === 0 ? (
            <EmptyStatePanel
              title="No claims match your search"
              description="Try a different claim number, employee name, or department."
            />
          ) : (
            <ExpenseApprovalClaimsTable
              items={filteredItems}
              selectedId={drawerOpen ? selectedId : null}
              onSelect={handleSelect}
            />
          )}
        </Box>
      )}

      <Drawer
        open={drawerOpen && Boolean(selectedId)}
        onClose={closeDrawer}
        anchor="right"
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520, md: 600 },
            maxWidth: '100%',
          },
        }}
      >
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Review claim
            </Typography>
            <Chip
              size="small"
              label="Close"
              onClick={closeDrawer}
              variant="outlined"
              clickable
            />
          </Stack>
          {selectedId ? (
            <ExpenseApprovalDetailPanel
              key={selectedId}
              claimId={selectedId}
              onSuccess={(msg) => show(msg, 'success')}
              onError={(msg) => show(msg, 'error')}
              onActionComplete={async () => {
                closeDrawer();
                await pendingQuery.refetch();
              }}
            />
          ) : null}
        </Box>
      </Drawer>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
      />
    </Box>
  );
}
