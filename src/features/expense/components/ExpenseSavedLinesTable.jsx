import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';

/**
 * @param {{
 *   lines: Array<{
 *     id: string,
 *     lineNo?: number,
 *     categoryName?: string,
 *     expenseDate?: string,
 *     merchant?: string,
 *     description?: string,
 *     amount?: string,
 *     hasReceipt?: boolean,
 *   }>,
 *   currency?: string,
 *   isLoading?: boolean,
 *   error?: Error | null,
 *   isEditable?: boolean,
 *   saving?: boolean,
 *   onAttachReceipt?: (lineId: string, file: File) => void,
 *   onDelete?: (lineId: string) => void,
 * }} props
 */
export function ExpenseSavedLinesTable({
  lines = [],
  currency = 'INR',
  isLoading = false,
  error = null,
  isEditable = false,
  saving = false,
  onAttachReceipt,
  onDelete,
}) {
  const isMobileLayout = useIsMobileLayout();

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading expenses...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!lines.length) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
        No expenses yet. Use the form above to add your first expense with a receipt.
      </Typography>
    );
  }

  const receiptInput = (line) => (
    <Button
      component="label"
      size="small"
      variant={line.hasReceipt ? 'outlined' : 'contained'}
      disabled={saving}
    >
      {line.hasReceipt ? 'Replace receipt' : 'Attach receipt'}
      <input
        hidden
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onAttachReceipt?.(line.id, file);
        }}
      />
    </Button>
  );

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5} sx={{ p: 2 }}>
        {lines.map((line) => (
          <MobileDataCard
            key={line.id}
            fields={[
              { label: '#', value: line.lineNo ?? '—' },
              {
                label: 'Category',
                value: (
                  <Chip
                    label={line.categoryName || '—'}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ),
              },
              { label: 'Date', value: line.expenseDate || '—' },
              { label: 'Merchant', value: line.merchant || '—' },
              { label: 'Description', value: line.description || '—' },
              {
                label: 'Amount',
                value: `${currency} ${line.amount}`,
              },
              {
                label: 'Receipt',
                value: (
                  <Chip
                    size="small"
                    color={line.hasReceipt ? 'success' : 'warning'}
                    label={line.hasReceipt ? 'Attached' : 'Missing'}
                  />
                ),
              },
            ]}
            actions={
              isEditable ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  {receiptInput(line)}
                  <TableRowActions
                    onDelete={() => onDelete?.(line.id)}
                    deleteDisabled={saving}
                  />
                </Stack>
              ) : null
            }
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: { xs: 0, md: 900 } }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell><strong>#</strong></TableCell>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Merchant</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell align="right"><strong>Amount</strong></TableCell>
            <TableCell><strong>Receipt</strong></TableCell>
            {isEditable ? (
              <TableCell align="right"><strong>Actions</strong></TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id} hover>
              <TableCell>{line.lineNo ?? '—'}</TableCell>
              <TableCell>
                <Chip
                  label={line.categoryName || '—'}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{line.expenseDate || '—'}</TableCell>
              <TableCell>{line.merchant || '—'}</TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 280,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {line.description || '—'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={600}>
                  {currency} {line.amount}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={line.hasReceipt ? 'success' : 'warning'}
                  label={line.hasReceipt ? 'Attached' : 'Missing'}
                />
              </TableCell>
              {isEditable ? (
                <TableCell
                  align="right"
                  className="table-actions-cell"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                    {receiptInput(line)}
                    <TableRowActions
                      onDelete={() => onDelete?.(line.id)}
                      deleteDisabled={saving}
                    />
                  </Stack>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
