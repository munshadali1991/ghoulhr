import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import {
  assignOrganizationSubscription,
  getOrganizationSubscription,
  renewOrganizationSubscription,
} from '@/features/super-admin/api/subscriptionsApi';
import { SubscriptionHistoryTable } from '@/features/super-admin/components/SubscriptionHistoryTable';
import { subscriptionQueryKeys } from '@/features/super-admin/hooks/useOrganizationSubscriptionHistory';
import {
  computeSubscriptionExpiresAt,
  daysRemaining,
  formatDisplayDate,
  formatSubscriptionType,
  toDateInputValue,
} from '@/features/super-admin/utils/subscriptionPeriodUtils';

const SUBSCRIPTION_TYPES = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'];

const EMPTY_FORM = {
  subscriptionType: 'MONTHLY',
  startsAt: toDateInputValue(),
  notes: '',
};

function statusChipProps(summary, reason) {
  if (!summary && reason === 'missing') {
    return { label: 'No plan', color: 'warning' };
  }
  if (summary?.isValid) {
    return { label: 'Active', color: 'success' };
  }
  if (reason === 'expired' || summary?.status === 'EXPIRED') {
    return { label: 'Expired', color: 'error' };
  }
  return { label: 'Inactive', color: 'default' };
}

/**
 * Super admin — assign and renew organization subscription plans.
 * @param {{ organizationId: string, onSubscriptionChanged?: () => void | Promise<void> }} props
 */
export function OrganizationSubscriptionPanel({ organizationId, onSubscriptionChanged }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const {
    data: current,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: subscriptionQueryKeys.current(organizationId),
    queryFn: () => getOrganizationSubscription(organizationId),
    enabled: Boolean(organizationId),
  });

  const invalidateSubscriptionData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: subscriptionQueryKeys.current(organizationId),
    });
    queryClient.invalidateQueries({
      queryKey: ['subscriptions', 'history', organizationId],
    });
    setHistoryRefreshKey((key) => key + 1);
  }, [organizationId, queryClient]);

  const summary = current?.summary;
  const reason = current?.reason ?? 'missing';
  const hasActivePlan = Boolean(summary);
  const chip = statusChipProps(summary, reason);

  const previewExpiresAt = useMemo(() => {
    if (!form.startsAt || !form.subscriptionType) return null;
    const starts = new Date(`${form.startsAt}T00:00:00`);
    if (Number.isNaN(starts.getTime())) return null;
    return computeSubscriptionExpiresAt(form.subscriptionType, starts);
  }, [form.startsAt, form.subscriptionType]);

  const remainingDays = summary?.expiresAt ? daysRemaining(summary.expiresAt) : null;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSuccess('');
  };

  const handleSubmit = async (mode) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        subscriptionType: form.subscriptionType,
        startsAt: form.startsAt,
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };

      if (mode === 'assign') {
        await assignOrganizationSubscription(organizationId, payload);
        setSuccess('Subscription plan assigned successfully.');
      } else {
        await renewOrganizationSubscription(organizationId, payload);
        setSuccess('Subscription renewed successfully.');
      }

      setForm({ ...EMPTY_FORM, startsAt: toDateInputValue() });
      invalidateSubscriptionData();
      await onSubscriptionChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  const displayError = error || loadError?.message;

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Control the organization&apos;s SaaS subscription. Employees cannot sign in when the
        plan is missing or expired.
      </Typography>

      {displayError ? <Alert severity="error">{displayError}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Current plan
            </Typography>
            {summary ? (
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  <strong>{formatSubscriptionType(summary.type)}</strong>
                  {' · '}
                  {formatDisplayDate(summary.startsAt)} → {formatDisplayDate(summary.expiresAt)}
                </Typography>
                {remainingDays != null && summary.isValid ? (
                  <Typography variant="caption" color="text.secondary">
                    {remainingDays > 0
                      ? `${remainingDays} day(s) remaining`
                      : 'Expires today'}
                  </Typography>
                ) : null}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active subscription assigned.
              </Typography>
            )}
          </Box>
          <Chip label={chip.label} color={chip.color} size="small" />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          {hasActivePlan ? 'Renew plan' : 'Assign plan'}
        </Typography>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Plan type</InputLabel>
              <Select
                label="Plan type"
                value={form.subscriptionType}
                onChange={handleChange('subscriptionType')}
              >
                {SUBSCRIPTION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatSubscriptionType(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Start date"
              type="date"
              size="small"
              fullWidth
              value={form.startsAt}
              onChange={handleChange('startsAt')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Notes (optional)"
              size="small"
              fullWidth
              value={form.notes}
              onChange={handleChange('notes')}
            />
          </Grid>
        </Grid>

        {previewExpiresAt ? (
          <Alert severity="info" sx={{ mt: 1.5 }}>
            Access valid through{' '}
            <strong>{formatDisplayDate(previewExpiresAt.toISOString())}</strong> (inclusive).
            Blocked from the following day.
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {hasActivePlan ? (
            <Button
              variant="contained"
              startIcon={<AutorenewRoundedIcon />}
              disabled={saving}
              onClick={() => handleSubmit('renew')}
            >
              {saving ? 'Saving…' : 'Renew plan'}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<EventAvailableRoundedIcon />}
              disabled={saving}
              onClick={() => handleSubmit('assign')}
            >
              {saving ? 'Saving…' : 'Assign plan'}
            </Button>
          )}
        </Stack>
      </Paper>

      <SubscriptionHistoryTable
        organizationId={organizationId}
        refreshKey={historyRefreshKey}
      />
    </Stack>
  );
}
