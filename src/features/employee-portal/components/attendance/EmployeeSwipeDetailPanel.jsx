import {
  Avatar,
  Box,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';

function DetailRow({ label, value }) {
  const display =
    value == null || value === '' ? '—' : value;
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" textAlign="right">
        {display}
      </Typography>
    </Stack>
  );
}

/**
 * @param {{ swipe: object | null }} props
 */
export function EmployeeSwipeDetailPanel({ swipe }) {
  if (!swipe) {
    return (
      <PageCard sx={{ height: '100%', p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Select a swipe to view details
        </Typography>
      </PageCard>
    );
  }

  return (
    <PageCard sx={{ height: '100%', p: 0, overflow: 'auto' }}>
      <Stack spacing={1.5} sx={{ p: 2.5 }} alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              typography: 'body2',
              fontWeight: 600,
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: '1.5px solid',
              borderColor: 'divider',
            }}
          >
            {swipe.initials || '?'}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              color: 'success.main',
              fontWeight: 600,
              border: 1,
              borderColor: 'success.main',
              borderRadius: 1,
              px: 1,
              py: 0.25,
            }}
          >
            {swipe.sourceLabel || 'Swipe'}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} sx={{ m: 0, letterSpacing: 0.5 }}>
          {swipe.swipeTime || '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {swipe.name || 'Employee'}
          {swipe.employeeCode ? ` · #${swipe.employeeCode}` : ''}
        </Typography>
      </Stack>

      <Divider />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Swipe Details
        </Typography>
        <DetailRow label="Device Name" value={swipe.deviceName} />
        <DetailRow label="Access Card" value={swipe.accessCard} />
        <DetailRow label="Door/Address" value={swipe.doorAddress} />
        <DetailRow label="Remarks" value={swipe.remarks} />
        <DetailRow label="Device ID" value={swipe.deviceId} />
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Location Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {swipe.locationSummary || '—'}
        </Typography>
      </Box>
    </PageCard>
  );
}
