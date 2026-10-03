import { Box, Button, Collapse, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useState } from 'react';
import { PageCard } from '@/shared/components/ui/PageCard';
import dayjs from 'dayjs';

/**
 * @param {{
 *   request: {
 *     id: string,
 *     workDate: string,
 *     inTime?: string,
 *     outTime?: string,
 *     reason?: string,
 *     status: string,
 *     approverName?: string,
 *     rejectionReason?: string,
 *     approvalNotes?: string,
 *     appliedOn: string,
 *   },
 *   onWithdraw?: (id: string) => void,
 *   withdrawing?: boolean,
 * }} props
 */
export function RegularizationRequestCard({ request, onWithdraw, withdrawing }) {
  const [expanded, setExpanded] = useState(request.status === 'REJECTED');

  const statusColor =
    request.status === 'APPROVED'
      ? 'success.main'
      : request.status === 'REJECTED'
        ? 'error.main'
        : 'text.primary';

  return (
    <PageCard sx={{ mb: 1.5 }}>
      <Box
        sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>
            {dayjs(request.workDate).format('DD MMM YYYY')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" fontWeight={700} sx={{ color: statusColor }}>
              {request.status}
            </Typography>
            <IconButton
              size="small"
              sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              <ExpandMoreRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {request.inTime ?? '—'} – {request.outTime ?? '—'}
          {request.approverName ? ` · ${request.approverName}` : ''}
        </Typography>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Field label="Reason" value={request.reason || '—'} />
          {request.rejectionReason ? (
            <Field label="Rejection reason" value={request.rejectionReason} />
          ) : null}
          {request.approvalNotes ? (
            <Field label="Approver notes" value={request.approvalNotes} />
          ) : null}
          <Field label="Applied on" value={dayjs(request.appliedOn).format('DD MMM YYYY')} />
          {request.status === 'PENDING' && onWithdraw ? (
            <Button
              size="small"
              color="warning"
              onClick={() => onWithdraw(request.id)}
              disabled={withdrawing}
              sx={{ mt: 1 }}
            >
              Withdraw
            </Button>
          ) : null}
        </Box>
      </Collapse>
    </PageCard>
  );
}

function Field({ label, value }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
