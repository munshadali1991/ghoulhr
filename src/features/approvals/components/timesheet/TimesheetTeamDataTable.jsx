import { useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { TimesheetStatusChip } from '@/features/employee-portal/components/timesheet/TimesheetStatusChip';
import { getTeamTimesheetRowKey } from '../../utils/teamTimesheetRowKey';

const PAGE_SIZE = 25;

const COLUMNS = [
  { id: 'employeeName', label: 'Employee', sortable: true },
  { id: 'workDate', label: 'Date', sortable: true },
  { id: 'totalHours', label: 'Hours', sortable: true, align: 'right' },
  { id: 'entryCount', label: 'Entries', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'submittedAt', label: 'Submitted', sortable: true },
];

function compareRows(a, b, orderBy, order) {
  const av = a[orderBy];
  const bv = b[orderBy];
  if (av == null && bv == null) return 0;
  if (av == null) return order === 'asc' ? -1 : 1;
  if (bv == null) return order === 'asc' ? 1 : -1;
  if (typeof av === 'number' && typeof bv === 'number') {
    return order === 'asc' ? av - bv : bv - av;
  }
  return order === 'asc'
    ? String(av).localeCompare(String(bv))
    : String(bv).localeCompare(String(av));
}

/**
 * @param {{
 *   rows: object[],
 *   selectedIds: Set<string>,
 *   selectedRowId: string | null,
 *   onToggleRow: (row: object) => void,
 *   onToggleAllActionable: () => void,
 *   onRowClick: (rowKey: string, row: object) => void,
 *   showEmployeeColumn?: boolean,
 * }} props
 */
export function TimesheetTeamDataTable({
  rows,
  selectedIds,
  selectedRowId,
  onToggleRow,
  onToggleAllActionable,
  onRowClick,
  showEmployeeColumn = true,
}) {
  const isMobileLayout = useIsMobileLayout();
  const [orderBy, setOrderBy] = useState('workDate');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);

  const actionableRows = useMemo(() => rows.filter((r) => r.canAct && r.id), [rows]);
  const allActionableSelected =
    actionableRows.length > 0 &&
    actionableRows.every((r) => selectedIds.has(r.id));
  const someActionableSelected = actionableRows.some((r) => selectedIds.has(r.id));

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => compareRows(a, b, orderBy, order));
    return copy;
  }, [rows, orderBy, order]);

  const pagedRows = useMemo(() => {
    const start = page * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, page]);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
    setPage(0);
  };

  const visibleColumns = showEmployeeColumn
    ? COLUMNS
    : COLUMNS.filter((c) => c.id !== 'employeeName');

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {pagedRows.map((row) => {
          const rowKey = getTeamTimesheetRowKey(row);
          return (
          <MobileDataCard
            key={rowKey}
            onClick={() => onRowClick(rowKey, row)}
            sx={{
              cursor: 'pointer',
              border: '2px solid',
              borderColor: rowKey === selectedRowId ? 'primary.main' : 'transparent',
            }}
            fields={[
              ...(row.canAct && row.id
                ? [
                    {
                      label: 'Select',
                      value: (
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => onToggleRow(row)}
                          inputProps={{ 'aria-label': `Select ${row.employeeName}` }}
                        />
                      ),
                    },
                  ]
                : []),
              ...(showEmployeeColumn ? [{ label: 'Employee', value: row.employeeName }] : []),
              { label: 'Date', value: dayjs(row.workDate).format('DD MMM YYYY') },
              { label: 'Hours', value: Number(row.totalHours).toFixed(1) },
              { label: 'Entries', value: row.entryCount },
              { label: 'Status', value: <TimesheetStatusChip status={row.status} /> },
            ]}
          />
          );
        })}
        {sortedRows.length > PAGE_SIZE ? (
          <TablePagination
            component="div"
            count={sortedRows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
          />
        ) : null}
      </Stack>
    );
  }

  return (
    <TableContainer component={PageCard}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someActionableSelected && !allActionableSelected}
                checked={allActionableSelected}
                onChange={onToggleAllActionable}
                disabled={actionableRows.length === 0}
                inputProps={{ 'aria-label': 'Select all actionable timesheets' }}
              />
            </TableCell>
            {visibleColumns.map((col) => (
              <TableCell key={col.id} align={col.align ?? 'left'}>
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    <strong>{col.label}</strong>
                  </TableSortLabel>
                ) : (
                  <strong>{col.label}</strong>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No timesheets match your filters.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            pagedRows.map((row) => {
              const rowKey = getTeamTimesheetRowKey(row);
              return (
              <TableRow
                key={rowKey}
                hover
                selected={rowKey === selectedRowId}
                sx={{ cursor: 'pointer' }}
                onClick={() => onRowClick(rowKey, row)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={row.id ? selectedIds.has(row.id) : false}
                    disabled={!row.canAct || !row.id}
                    onChange={() => onToggleRow(row)}
                    inputProps={{ 'aria-label': `Select ${row.employeeName}` }}
                  />
                </TableCell>
                {showEmployeeColumn ? <TableCell>{row.employeeName}</TableCell> : null}
                <TableCell>{dayjs(row.workDate).format('DD MMM YYYY')}</TableCell>
                <TableCell align="right">{Number(row.totalHours).toFixed(1)}</TableCell>
                <TableCell align="right">{row.entryCount}</TableCell>
                <TableCell>
                  <TimesheetStatusChip status={row.status} />
                </TableCell>
                <TableCell>
                  {row.submittedAt ? dayjs(row.submittedAt).format('DD MMM YYYY') : '—'}
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {sortedRows.length > PAGE_SIZE ? (
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={sortedRows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
          />
        </Box>
      ) : null}
    </TableContainer>
  );
}
