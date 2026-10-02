import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import {
  useOwnExpenseClaims,
  useWithdrawExpenseClaim,
} from '../hooks/useExpenseQueries';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';

const STATUS_COLORS = {
  DRAFT: 'default',
  PENDING_MANAGER: 'warning',
  PENDING_FINANCE: 'info',
  SENT_BACK: 'secondary',
  APPROVED: 'success',
  PAID: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'default',
};

export function ExpenseClaimsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const { data, isLoading, isError, error } = useOwnExpenseClaims(status || undefined);
  const withdraw = useWithdrawExpenseClaim();
  const { snackbar, show, close } = useAppSnackbar();

  const claims = useMemo(() => data ?? [], [data]);

  const handleWithdraw = async (id) => {
    try {
      await withdraw.mutateAsync(id);
      show('Claim withdrawn', 'success');
    } catch (err) {
      show(err?.message || 'Failed to withdraw claim', 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Expense Claims"
        primaryAction={
          <Button variant="contained" onClick={() => navigate('/expense/claims/new')}>
            New claim
          </Button>
        }
      />
      <PageCard sx={{ p: 2, mt: 2 }}>
        <Stack spacing={2}>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ maxWidth: 240 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.keys(STATUS_COLORS).map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </TextField>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {isError && (
            <Alert severity="error">{error?.message || 'Failed to load claims'}</Alert>
          )}
          {!isLoading && !isError && claims.length === 0 && (
            <EmptyStatePanel
              title="No expense claims yet"
              description="Create a claim to request reimbursement for business expenses."
            />
          )}
          {claims.map((claim) => (
            <Box
              key={claim.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {claim.claimNumber} · {claim.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {claim.currency} {claim.totalAmount}
                </Typography>
                <Chip
                  size="small"
                  label={claim.status.replace(/_/g, ' ')}
                  color={STATUS_COLORS[claim.status] || 'default'}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  component={RouterLink}
                  to={`/expense/claims/${claim.id}`}
                  size="small"
                >
                  Open
                </Button>
                {['DRAFT', 'SENT_BACK', 'PENDING_MANAGER', 'PENDING_FINANCE'].includes(
                  claim.status,
                ) && (
                  <Button
                    size="small"
                    color="inherit"
                    disabled={withdraw.isPending}
                    onClick={() => handleWithdraw(claim.id)}
                  >
                    Withdraw
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </PageCard>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Box>
  );
}
