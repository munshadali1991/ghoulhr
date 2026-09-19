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

/**
 * @param {{
 *   items: Array<{
 *     id: string,
 *     claimNumber?: string,
 *     employeeName?: string,
 *     employeeCode?: string,
 *     departmentName?: string,
 *     currency?: string,
 *     totalAmount?: string,
 *     submittedAt?: string | null,
 *   }>,
 *   selectedId?: string | null,
 *   onSelect: (id: string) => void,
 * }} props
 */
export function ExpenseApprovalClaimsTable({ items, selectedId, onSelect }) {
  return (
    <PageCard sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: { xs: '70vh', md: 'calc(100vh - 220px)' } }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Claim</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const selected = selectedId === item.id;
              return (
                <TableRow
                  key={item.id}
                  hover
                  selected={selected}
                  onClick={() => onSelect(item.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {item.claimNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.employeeName}
                    </Typography>
                    {item.employeeCode ? (
                      <Typography variant="caption" color="text.secondary">
                        {item.employeeCode}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.departmentName || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} whiteSpace="nowrap">
                      {item.currency || 'INR'} {item.totalAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" whiteSpace="nowrap">
                      {item.submittedAt
                        ? dayjs(item.submittedAt).format('DD MMM YYYY')
                        : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!items.length ? (
        <Box sx={{ px: 2, py: 4 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No claims match your search.
          </Typography>
        </Box>
      ) : null}
    </PageCard>
  );
}
