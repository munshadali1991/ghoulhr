import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';

/**
 * @param {{
 *   open: boolean,
 *   count: number,
 *   mode: 'selected' | 'range',
 *   from?: string,
 *   to?: string,
 *   employeeName?: string,
 *   isPending?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function BulkApproveTimesheetDialog({
  open,
  count,
  mode,
  from,
  to,
  employeeName,
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const rangeLabel =
    from && to
      ? `${dayjs(from).format('DD MMM YYYY')} – ${dayjs(to).format('DD MMM YYYY')}`
      : '';

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>
        {mode === 'selected' ? 'Approve selected timesheets' : 'Approve all pending in range'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          You are about to approve <strong>{count}</strong> submitted timesheet
          {count === 1 ? '' : 's'}.
        </Typography>
        {mode === 'range' && rangeLabel ? (
          <Typography variant="body2" color="text.secondary">
            Date range: {rangeLabel}
            {employeeName ? ` · Employee: ${employeeName}` : ''}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Approved timesheets cannot be edited by employees without reopening.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={onConfirm} disabled={isPending}>
          Approve {count}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
