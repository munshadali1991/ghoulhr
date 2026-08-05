import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { ASSESSMENT_STATUS, ASSESSMENT_STATUS_META } from '../constants/performanceEnums';

const PAGE_SIZE = 25;

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: ASSESSMENT_STATUS.DRAFT, label: ASSESSMENT_STATUS_META.DRAFT.label },
  { value: ASSESSMENT_STATUS.SUBMITTED, label: ASSESSMENT_STATUS_META.SUBMITTED.label },
  {
    value: ASSESSMENT_STATUS.MANAGER_REVIEWED,
    label: ASSESSMENT_STATUS_META.MANAGER_REVIEWED.label,
  },
  { value: ASSESSMENT_STATUS.COMPLETED, label: ASSESSMENT_STATUS_META.COMPLETED.label },
];

function StatusChip({ status }) {
  const meta = ASSESSMENT_STATUS_META[status] ?? { label: status, color: 'default' };
  return <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />;
}

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

function formatDate(value) {
  return value ? dayjs(value).format('DD MMM YYYY') : '—';
}

function formatScore(score) {
  const n = Number(score ?? 0);
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}

/**
 * @param {{
 *   rows: object[],
 *   showEmployeeColumn?: boolean,
 *   statusFilter?: string,
 *   onStatusFilterChange?: (value: string) => void,
 *   search?: string,
 *   onSearchChange?: (value: string) => void,
 *   onRowClick: (row: object) => void,
 * }} props
 */
export function AssessmentsDataTable({
  rows,
  showEmployeeColumn = true,
  statusFilter = '',
  onStatusFilterChange,
  search = '',
  onSearchChange,
  onRowClick,
}) {
  const isMobileLayout = useIsMobileLayout();
  const [orderBy, setOrderBy] = useState(showEmployeeColumn ? 'employeeName' : 'updatedAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);

  const columns = useMemo(() => {
    const base = [
      ...(showEmployeeColumn
        ? [{ id: 'employeeName', label: 'Employee', sortable: true }]
        : []),
      { id: 'cycleLabel', label: 'Cycle', sortable: true },
      { id: 'status', label: 'Status', sortable: true },
      { id: 'score', label: 'Score', sortable: true, align: 'right' },
      { id: 'dueDate', label: 'Due date', sortable: true },
      { id: 'updatedAt', label: 'Updated', sortable: true },
    ];
    return base;
  }, [showEmployeeColumn]);

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

  const toolbar = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      {onSearchChange ? (
        <TextField
          size="small"
          label="Search"
          placeholder="Employee, code, or cycle"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: { sm: 240 }, flex: 1 }}
        />
      ) : null}
      {onStatusFilterChange ? (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              onStatusFilterChange(e.target.value);
              setPage(0);
            }}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
    </Stack>
  );

  if (isMobileLayout) {
    return (
      <Box>
        {toolbar}
        {pagedRows.length === 0 ? (
          <PageCard sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              No assessments match your filters.
            </Typography>
          </PageCard>
        ) : (
          <Stack spacing={1.5}>
            {pagedRows.map((row) => (
              <MobileDataCard
                key={row.id}
                onClick={() => onRowClick(row)}
                sx={{ cursor: 'pointer' }}
                fields={[
                  ...(showEmployeeColumn
                    ? [
                        {
                          label: 'Employee',
                          value: row.employeeName
                            ? `${row.employeeName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`
                            : '—',
                        },
                      ]
                    : []),
                  { label: 'Cycle', value: row.cycleLabel },
                  { label: 'Status', value: <StatusChip status={row.status} /> },
                  { label: 'Score', value: formatScore(row.score) },
                  { label: 'Due', value: formatDate(row.dueDate) },
                  { label: 'Updated', value: formatDate(row.updatedAt) },
                ]}
              />
            ))}
          </Stack>
        )}
        {sortedRows.length > PAGE_SIZE ? (
          <TablePagination
            component="div"
            count={sortedRows.length}
            page={page}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
          />
        ) : null}
      </Box>
    );
  }

  return (
    <Box>
      {toolbar}
      <PageCard sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align ?? 'left'}>
                    {col.sortable ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No assessments match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onRowClick(row)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {showEmployeeColumn ? (
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.employeeName ?? '—'}
                        </Typography>
                        {row.employeeCode ? (
                          <Typography variant="caption" color="text.secondary">
                            {row.employeeCode}
                          </Typography>
                        ) : null}
                      </TableCell>
                    ) : null}
                    <TableCell>{row.cycleLabel}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">{formatScore(row.score)}</TableCell>
                    <TableCell>{formatDate(row.dueDate)}</TableCell>
                    <TableCell>{formatDate(row.updatedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
        />
      </PageCard>
    </Box>
  );
}
