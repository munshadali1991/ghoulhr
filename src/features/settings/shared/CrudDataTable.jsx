import {
  Box,
  Paper,
  Skeleton,
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
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
import { EmptyState } from './EmptyState';

/**
 * @param {{
 *   columns: { id: string, label: string, align?: string, render?: (row: object) => import('react').ReactNode }[],
 *   rows: object[],
 *   rowKey?: string,
 *   isLoading?: boolean,
 *   emptyTitle?: string,
 *   emptyDescription?: string,
 *   onEdit?: (row: object) => void,
 *   onDelete?: (row: object) => void,
 *   onToggleActive?: (row: object, nextActive: boolean) => void,
 *   activeField?: string,
 *   readOnly?: boolean,
 *   renderMobileCard?: (row: object, actions: import('react').ReactNode) => import('react').ReactNode,
 *   toggleActiveDisabled?: boolean,
 * }} props
 */
export function CrudDataTable({
  columns,
  rows,
  rowKey = 'id',
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onEdit,
  onDelete,
  onToggleActive,
  activeField = 'isActive',
  readOnly = false,
  renderMobileCard,
  toggleActiveDisabled = false,
}) {
  const isMobileLayout = useIsMobileLayout();
  const showActiveColumn = typeof onToggleActive === 'function';

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </Stack>
    );
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const isRowActive = (row) => row?.[activeField] !== false;

  const activeSwitch = (row) =>
    showActiveColumn ? (
      <ActiveSwitchCell
        checked={isRowActive(row)}
        disabled={readOnly || toggleActiveDisabled}
        ariaLabel={`Active for ${row.name || row[rowKey] || 'row'}`}
        onChange={(next) => onToggleActive(row, next)}
      />
    ) : null;

  const actionButtons = (row) =>
    readOnly ? null : (
      <TableRowActions
        onEdit={onEdit ? () => onEdit(row) : undefined}
        onDelete={onDelete ? () => onDelete(row) : undefined}
      />
    );

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {rows.map((row) => {
          const fields = columns.map((col) => ({
            label: col.label,
            value: col.render ? col.render(row) : row[col.id],
          }));
          if (showActiveColumn) {
            fields.push({ label: 'Active', value: activeSwitch(row) });
          }

          return renderMobileCard ? (
            <Box key={row[rowKey]}>{renderMobileCard(row, actionButtons(row))}</Box>
          ) : (
            <MobileDataCard
              key={row[rowKey]}
              fields={fields}
              actions={actionButtons(row)}
            />
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table size="medium" aria-label="Data table" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 600 }}>
                {col.label}
              </TableCell>
            ))}
            {showActiveColumn ? (
              <TableCell align="center" sx={{ fontWeight: 600, width: 88 }}>
                Active
              </TableCell>
            ) : null}
            <TableCell align="right" sx={{ fontWeight: 600, width: 112 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[rowKey]} hover>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.render ? col.render(row) : row[col.id]}
                </TableCell>
              ))}
              {showActiveColumn ? (
                <TableCell align="center">{activeSwitch(row)}</TableCell>
              ) : null}
              <TableCell align="right" className="table-actions-cell">
                {actionButtons(row)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function StatusChipCell({ active }) {
  return (
    <Typography
      component="span"
      variant="caption"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        fontWeight: 600,
        bgcolor: active ? 'success.light' : 'action.selected',
        color: active ? 'success.dark' : 'text.secondary',
      }}
    >
      {active ? 'Active' : 'Inactive'}
    </Typography>
  );
}
