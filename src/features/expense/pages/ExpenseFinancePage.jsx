import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { exportExpenseCsv } from '../api/expenseApi';
import {
  useFinanceClaimDetail,
  useFinanceExpenseActions,
  useFinancePending,
  usePayableClaims,
} from '../hooks/useExpenseQueries';

export function ExpenseFinancePage() {
  const [tab, setTab] = useState('pending');
  const pendingQuery = useFinancePending(tab === 'pending');
  const payableQuery = usePayableClaims(tab === 'payable');
  const items = (tab === 'pending' ? pendingQuery.data : payableQuery.data) ?? [];
  const [selectedId, setSelectedId] = useState(null);
  const detailQuery = useFinanceClaimDetail(selectedId, Boolean(selectedId));
  const actions = useFinanceExpenseActions();
  const { snackbar, show, close } = useAppSnackbar();
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMode, setPaymentMode] = useState('BANK');

  useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !items.some((i) => i.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const run = async (fn, msg) => {
    try {
      await fn();
      show(msg, 'success');
      await pendingQuery.refetch();
      await payableQuery.refetch();
    } catch (err) {
      show(err?.message || 'Action failed', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportExpenseCsv(tab === 'payable' ? 'APPROVED' : 'BOTH');
      const blob = new Blob([typeof csv === 'string' ? csv : String(csv)], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-export-${tab}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      show('Export downloaded', 'success');
    } catch (err) {
      show(err?.message || 'Export failed', 'error');
    }
  };

  const detail = detailQuery.data;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 2 }}
        spacing={1}
      >
        <Typography variant="h5">Expense finance</Typography>
        <Button variant="outlined" onClick={handleExport}>
          Export CSV
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="pending" label="Pending finance" />
        <Tab value="payable" label="Payable" />
      </Tabs>

      {(tab === 'pending' ? pendingQuery.isLoading : payableQuery.isLoading) && (
        <CircularProgress size={28} />
      )}

      {!items.length && !(tab === 'pending' ? pendingQuery.isLoading : payableQuery.isLoading) && (
        <EmptyStatePanel
          title={tab === 'pending' ? 'No finance queue items' : 'No payable claims'}
          description="Approved claims ready for settlement will appear here."
        />
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Stack spacing={1} sx={{ minWidth: 260, flex: 1 }}>
          {items.map((item) => (
            <Box
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: selectedId === item.id ? 'primary.main' : 'divider',
                cursor: 'pointer',
              }}
            >
              <Typography fontWeight={600}>{item.claimNumber}</Typography>
              <Typography variant="body2">{item.employeeName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.currency} {item.totalAmount}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{ flex: 2 }}>
          {!selectedId && <Typography color="text.secondary">Select a claim</Typography>}
          {detailQuery.isLoading && <CircularProgress size={28} />}
          {detailQuery.isError && (
            <Alert severity="error">{detailQuery.error?.message}</Alert>
          )}
          {detail && (
            <Stack spacing={2}>
              <Typography variant="h6">
                {detail.claimNumber} · {detail.title}
              </Typography>
              <Typography>
                {detail.currency} {detail.totalAmount} · {detail.status}
              </Typography>
              {(detail.lines || []).map((line) => (
                <Typography key={line.id} variant="body2">
                  #{line.lineNo} {line.categoryName}: {line.merchant} · {line.amount} (
                  {line.expenseDate})
                </Typography>
              ))}

              {tab === 'pending' && (
                <>
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="Reject / send-back reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    multiline
                    minRows={2}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      onClick={() =>
                        run(
                          () => actions.approve.mutateAsync({ id: selectedId, notes }),
                          'Finance approved',
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() =>
                        run(
                          () =>
                            actions.sendBack.mutateAsync({ id: selectedId, reason }),
                          'Sent back',
                        )
                      }
                    >
                      Send back
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        run(
                          () => actions.reject.mutateAsync({ id: selectedId, reason }),
                          'Rejected',
                        )
                      }
                    >
                      Reject
                    </Button>
                  </Stack>
                </>
              )}

              {tab === 'payable' && (
                <>
                  <TextField
                    type="date"
                    label="Paid on"
                    InputLabelProps={{ shrink: true }}
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                  <TextField
                    label="Payment reference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                  <TextField
                    select
                    label="Payment mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    {['BANK', 'UPI', 'CHEQUE', 'OTHER'].map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={() =>
                      run(
                        () =>
                          actions.markPaid.mutateAsync({
                            id: selectedId,
                            payload: { paidAt, paymentReference, paymentMode },
                          }),
                        'Marked as paid',
                      )
                    }
                  >
                    Mark as paid
                  </Button>
                </>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Box>
  );
}
