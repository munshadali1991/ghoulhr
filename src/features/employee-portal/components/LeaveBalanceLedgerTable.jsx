import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { EmptyStatePanel } from './EmptyStatePanel';

/**
 * @param {string} dateStr
 * @param {string} session
 */
function formatLeaveRange(dateStr, session) {
  const dateLabel = dayjs(dateStr).format('DD MMM YYYY');
  return (
    <Box>
      <Typography variant="body2">{dateLabel}</Typography>
      <Typography variant="caption" color="text.secondary">
        {session}
      </Typography>
    </Box>
  );
}

/**
 * @param {{
 *   transactions: import('../types/employeePortal.types').LeaveBalanceLedgerTransaction[],
 * }} props
 */
export function LeaveBalanceLedgerTable({ transactions }) {
  if (!transactions.length) {
    return (
      <PageCard>
        <EmptyStatePanel title="No transactions" message="Leave applications for this year will appear here." />
      </PageCard>
    );
  }

  const headerSx = {
    fontWeight: 700,
    bgcolor: 'primary.light',
    color: 'primary.contrastText',
    whiteSpace: 'nowrap',
    py: 1.25,
  };

  return (
    <PageCard sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>Transaction type</TableCell>
              <TableCell sx={headerSx}>Posted Date</TableCell>
              <TableCell sx={headerSx}>From</TableCell>
              <TableCell sx={headerSx}>To</TableCell>
              <TableCell sx={headerSx} align="right">
                Days
              </TableCell>
              <TableCell sx={headerSx}>Reason</TableCell>
              <TableCell sx={headerSx}>Remarks</TableCell>
              <TableCell sx={headerSx}>Expiry Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ maxWidth: 160 }}>
                  <Typography variant="body2" noWrap title={row.transactionType}>
                    {row.transactionType}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {row.postedOn ? dayjs(row.postedOn).format('DD MMM YYYY') : '—'}
                </TableCell>
                <TableCell>{formatLeaveRange(row.fromDate, row.fromSession)}</TableCell>
                <TableCell>{formatLeaveRange(row.toDate, row.toSession)}</TableCell>
                <TableCell align="right">{row.days}</TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" noWrap title={row.reason ?? ''}>
                    {row.reason || '—'}
                  </Typography>
                </TableCell>
                <TableCell>{row.remarks ?? '—'}</TableCell>
                <TableCell>{row.expiryDate ? dayjs(row.expiryDate).format('DD MMM YYYY') : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageCard>
  );
}
