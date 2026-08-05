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
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from './MobileDataCard';

/**
 * @param {{
 *   columns: { id: string, label: string, align?: 'left' | 'right' | 'center', render?: (row: object) => import('react').ReactNode }[],
 *   rows: object[],
 *   rowKey?: string,
 *   tableMinWidth?: number,
 *   renderMobileCard?: (row: object) => import('react').ReactNode,
 *   onRowClick?: (row: object) => void,
 *   tableHeadSx?: object,
 *   tableBodySx?: object,
 *   emptyMessage?: string,
 * }} props
 */
export function ResponsiveDataTable({
  columns,
  rows,
  rowKey = 'id',
  tableMinWidth = 0,
  renderMobileCard,
  onRowClick,
  tableHeadSx,
  tableBodySx,
  emptyMessage = 'No data',
}) {
  const isMobileLayout = useIsMobileLayout();

  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        {emptyMessage}
      </Typography>
    );
  }

  if (isMobileLayout) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rows.map((row) =>
          renderMobileCard ? (
            <Box key={row[rowKey]}>{renderMobileCard(row)}</Box>
          ) : (
            <MobileDataCard
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              fields={columns.map((col) => ({
                label: col.label,
                value: col.render ? col.render(row) : row[col.id],
              }))}
            />
          ),
        )}
      </Box>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table
        size="small"
        sx={{
          ...tableBodySx,
          minWidth: tableMinWidth ? { xs: 0, md: tableMinWidth } : 0,
        }}
      >
        <TableHead sx={tableHeadSx}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row[rowKey]}
              hover={Boolean(onRowClick)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.render ? col.render(row) : row[col.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
