import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ResponsiveDataTable } from '@/shared/components/data/ResponsiveDataTable';
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

const LEDGER_COLUMNS = [
  { id: 'transactionType', label: 'Transaction type' },
  {
    id: 'postedOn',
    label: 'Posted Date',
    render: (row) => (row.postedOn ? dayjs(row.postedOn).format('DD MMM YYYY') : '—'),
  },
  {
    id: 'fromDate',
    label: 'From',
    render: (row) => formatLeaveRange(row.fromDate, row.fromSession),
  },
  {
    id: 'toDate',
    label: 'To',
    render: (row) => formatLeaveRange(row.toDate, row.toSession),
  },
  { id: 'days', label: 'Days', align: 'right' },
  {
    id: 'reason',
    label: 'Reason',
    render: (row) => row.reason || '—',
  },
  { id: 'remarks', label: 'Remarks', render: (row) => row.remarks ?? '—' },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    render: (row) => (row.expiryDate ? dayjs(row.expiryDate).format('DD MMM YYYY') : '—'),
  },
];

const headerSx = {
  fontWeight: 700,
  bgcolor: 'primary.light',
  color: 'primary.contrastText',
  whiteSpace: { xs: 'normal', md: 'nowrap' },
  py: 1.25,
};

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

  return (
    <PageCard sx={{ overflow: 'hidden', p: { xs: 1.5, sm: 2 } }}>
      <ResponsiveDataTable
        columns={LEDGER_COLUMNS}
        rows={transactions}
        rowKey="id"
        tableMinWidth={720}
        tableHeadSx={{
          '& .MuiTableCell-root': headerSx,
        }}
        emptyMessage="No transactions"
      />
    </PageCard>
  );
}
