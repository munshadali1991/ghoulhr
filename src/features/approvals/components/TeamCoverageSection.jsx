import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';

/**
 * @param {{ teamCoverage: import('../types/approvals.types').LeaveApprovalDetail['teamCoverage'] }} props
 */
export function TeamCoverageSection({ teamCoverage }) {
  if (teamCoverage.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No other team members on leave during these dates.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Employee</TableCell>
          <TableCell>Leave type</TableCell>
          <TableCell>Period</TableCell>
          <TableCell align="right">Days</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {teamCoverage.map((row) => (
          <TableRow key={`${row.employeeId}-${row.startDate}`}>
            <TableCell>{row.employeeName}</TableCell>
            <TableCell>{row.leaveType}</TableCell>
            <TableCell>
              {dayjs(row.startDate).format('DD MMM')} – {dayjs(row.endDate).format('DD MMM')}
            </TableCell>
            <TableCell align="right">{row.daysCount}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
