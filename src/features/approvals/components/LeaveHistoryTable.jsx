import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';

/**
 * @param {{ history: import('../types/approvals.types').LeaveApprovalDetail['history'] }} props
 */
export function LeaveHistoryTable({ history }) {
  if (history.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No prior leave history.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Type</TableCell>
          <TableCell>Period</TableCell>
          <TableCell align="right">Days</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {history.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.leaveType}</TableCell>
            <TableCell>
              {dayjs(row.duration.startDate).format('DD MMM')} –{' '}
              {dayjs(row.duration.endDate).format('DD MMM YYYY')}
            </TableCell>
            <TableCell align="right">{row.daysCount}</TableCell>
            <TableCell>
              <Chip
                label={row.status}
                size="small"
                color={
                  row.status === 'APPROVED'
                    ? 'success'
                    : row.status === 'REJECTED'
                      ? 'error'
                      : 'default'
                }
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
