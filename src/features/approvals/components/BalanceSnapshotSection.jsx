import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

/**
 * @param {{
 *   balanceSnapshot: import('../types/approvals.types').LeaveApprovalDetail['balanceSnapshot'],
 *   allBalances: import('../types/approvals.types').LeaveApprovalDetail['allBalances'],
 * }} props
 */
export function BalanceSnapshotSection({ balanceSnapshot, allBalances }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Leave balances
      </Typography>

      {balanceSnapshot ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            mb: 2,
            p: 1.5,
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Metric label="Granted" value={balanceSnapshot.granted} />
          <Metric label="Used" value={balanceSnapshot.consumed} />
          <Metric label="Pending" value={balanceSnapshot.pending} />
          <Metric label="Available" value={balanceSnapshot.available} highlight />
        </Box>
      ) : null}

      {allBalances.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell align="right">Granted</TableCell>
              <TableCell align="right">Used</TableCell>
              <TableCell align="right">Pending</TableCell>
              <TableCell align="right">Available</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allBalances.map((row) => (
              <TableRow key={row.leaveType}>
                <TableCell>{row.leaveType}</TableCell>
                <TableCell align="right">{row.granted}</TableCell>
                <TableCell align="right">{row.consumed}</TableCell>
                <TableCell align="right">{row.pending}</TableCell>
                <TableCell align="right">{row.available}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No balance data available.
        </Typography>
      )}
    </Box>
  );
}

/**
 * @param {{ label: string, value: number, highlight?: boolean }} props
 */
function Metric({ label, value, highlight }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={highlight ? 700 : 600}>
        {value}
      </Typography>
    </Box>
  );
}
