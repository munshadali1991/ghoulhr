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
        sx={{
          px: 2,
          py: 1.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr auto', md: 'repeat(4, 1fr) auto' },
          gap: 1,
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Field label="Category" value={request.category} />
        <Field label="Leave Type" value={request.leaveType} />
        {mode === 'pending' ? (
          <Field label="Pending with" value={request.approverName ?? '—'} />
        ) : (
          <Field label="Status" value={request.status} valueSx={{ color: statusColor, fontWeight: 700 }} />
        )}
        <Field label="No. of days" value={String(request.daysCount)} />
        <IconButton
          size="small"
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
          aria-expanded={expanded}
        >
          <ExpandMoreRoundedIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Stack spacing={1.5}>
            <Field label="Duration" value={formatDuration()} fullWidth />
            <Field label="Reason" value={request.reason || '—'} fullWidth />
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Applied on {dayjs(request.appliedOn).format('DD MMM, YYYY')}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Link component="button" variant="body2" underline="hover">
                  View Details
                </Link>
                {mode === 'pending' && onWithdraw ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    disabled={withdrawing}
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
      <Typography variant="body2" fontWeight={600} sx={valueSx}>
        {value}
      </Typography>
    </Box>
  );
}
