import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

/**
 * @param {{ request: import('../types/approvals.types').LeaveApprovalRequest }} props
 */
export function LeaveRequestDetailsSection({ request }) {
  const { duration } = request;
  const fmt = (d) => dayjs(d).format('DD MMM YYYY');

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Leave request
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        <Field label="Leave type" value={request.leaveType} />
        <Field label="Category" value={request.category} />
        <Field label="From" value={`${fmt(duration.startDate)} (${duration.startSession})`} />
        <Field label="To" value={`${fmt(duration.endDate)} (${duration.endSession})`} />
        <Field label="Total days" value={String(request.daysCount)} />
        <Field label="Applied on" value={fmt(request.appliedOn)} />
        <Field label="Reason" value={request.reason || '—'} fullWidth />
        <Field label="Contact details" value={request.contactDetails || '—'} fullWidth />
      </Box>
    </Box>
  );
}

/**
 * @param {{ label: string, value: string, fullWidth?: boolean }} props
 */
function Field({ label, value, fullWidth }) {
  return (
    <Box sx={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}
