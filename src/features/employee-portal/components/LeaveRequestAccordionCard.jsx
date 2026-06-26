import {
  Box,
  Button,
  Collapse,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useState } from 'react';
import { PageCard } from '@/shared/components/ui/PageCard';
import dayjs from 'dayjs';

/**
 * @param {{
 *   request: import('../types/employeePortal.types').LeaveRequest,
 *   mode: 'pending' | 'history',
 *   onWithdraw?: (id: string) => void,
 *   withdrawing?: boolean,
 * }} props
 */
export function LeaveRequestAccordionCard({ request, mode, onWithdraw, withdrawing }) {
  const [expanded, setExpanded] = useState(mode === 'pending' && request.id === 'lr-1');

  const statusColor =
    request.status === 'APPROVED'
      ? 'success.main'
      : request.status === 'REJECTED'
        ? 'error.main'
        : 'text.primary';

  const formatDuration = () => {
    const { startDate, endDate, startSession, endSession } = request.duration;
    const fmt = (d) => dayjs(d).format('DD MMM YYYY');
    return `${fmt(startDate)} (${startSession}) to ${fmt(endDate)} (${endSession})`;
  };

  return (
    <PageCard sx={{ mb: 1.5 }}>
      <Box
        sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: { xs: 1, md: 0 } }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 0, pr: 1 }}>
            {request.leaveType}
          </Typography>
          <IconButton
            size="small"
            sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}
            aria-expanded={expanded}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            <ExpandMoreRoundedIcon />
          </IconButton>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          <Field label="Category" value={request.category} />
          {mode === 'pending' ? (
            <Field label="Pending with" value={request.approverName ?? '—'} />
          ) : (
            <Field label="Status" value={request.status} valueSx={{ color: statusColor, fontWeight: 700 }} />
          )}
          <Field label="No. of days" value={String(request.daysCount)} />
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Stack spacing={1.5}>
            <Field label="Duration" value={formatDuration()} fullWidth />
            <Field label="Reason" value={request.reason || '—'} fullWidth />
            {request.rejectionReason ? (
              <Field
                label="Manager feedback"
                value={request.rejectionReason}
                fullWidth
                valueSx={{ color: 'error.main' }}
              />
            ) : null}
            {request.approvalNotes ? (
              <Field label="Approver notes" value={request.approvalNotes} fullWidth />
            ) : null}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1}
            >
              <Typography variant="caption" color="text.secondary">
                Applied on {dayjs(request.appliedOn).format('DD MMM, YYYY')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Link component="button" variant="body2" underline="hover" sx={{ textAlign: { xs: 'left', sm: 'inherit' } }}>
                  View Details
                </Link>
                {mode === 'pending' && onWithdraw ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    disabled={withdrawing}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWithdraw(request.id);
                    }}
                  >
                    Withdraw
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </PageCard>
  );
}

/**
 * @param {{ label: string, value: string, fullWidth?: boolean, valueSx?: object }} props
 */
function Field({ label, value, fullWidth, valueSx }) {
  return (
    <Box sx={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ ...valueSx, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}
