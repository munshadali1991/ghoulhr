import { useEffect, useMemo, useState } from 'react';
import {
  Box,
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

const DEFAULT_ROWS_PER_PAGE = 10;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

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
 *   selectedRowId: string | null,
 *   onRowClick: (rowKey: string, row: object) => void,
 *   showEmployeeColumn?: boolean,
 * }} props
 */
export function TimesheetTeamDataTable({
  rows,
  selectedRowId,
  onRowClick,
  showEmployeeColumn = true,
}) {
  const isMobileLayout = useIsMobileLayout();
  const [orderBy, setOrderBy] = useState('workDate');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => compareRows(a, b, orderBy, order));
    return copy;
  }, [rows, orderBy, order]);

  useEffect(() => {
    setPage(0);
  }, [rows]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [sortedRows.length, rowsPerPage, page]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
    setPage(0);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const visibleColumns = showEmployeeColumn
    ? COLUMNS
    : COLUMNS.filter((c) => c.id !== 'employeeName');

  const pagination = (
    <TablePagination
      component="div"
      count={sortedRows.length}
      page={page}
      onPageChange={(_, p) => setPage(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
    />
  );

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
                ...(showEmployeeColumn ? [{ label: 'Employee', value: row.employeeName }] : []),
                { label: 'Date', value: dayjs(row.workDate).format('DD MMM YYYY') },
                { label: 'Hours', value: Number(row.totalHours).toFixed(1) },
                { label: 'Entries', value: row.entryCount },
                { label: 'Status', value: <TimesheetStatusChip status={row.status} /> },
              ]}
            />
          );
        })}
        {pagination}
      </Stack>
    );
  }

  return (
    <TableContainer component={PageCard}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
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
              <TableCell colSpan={visibleColumns.length}>
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
      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>{pagination}</Box>
    </TableContainer>
  );
}
