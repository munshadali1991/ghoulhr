import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { TimesheetStatusChip } from './TimesheetStatusChip';
import {
  useTimesheetDay,
  useTimesheetReportEntries,
} from '../../hooks/useEmployeePortalQueries';
import { apiEntryToDisplay } from '../../utils/timesheetEntryMappers';
import {
  copyReportToClipboard,
  downloadTextFile,
  matrixToCsv,
  printReportAsPdf,
  reportRowsToMatrix,
} from '../../utils/timesheetReportExport';

function defaultAllRange() {
  return {
    from: dayjs().startOf('year').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
  };
}

const PAGE_SIZES = [
  { value: 'all', label: 'All' },
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function compareValues(a, b, order) {
  if (a == null && b == null) return 0;
  if (a == null) return order === 'asc' ? -1 : 1;
  if (b == null) return order === 'asc' ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') {
    return order === 'asc' ? a - b : b - a;
  }
  return order === 'asc'
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
}

/**
 * @param {{
 *   initialDate?: string,
 *   onBack: () => void,
 *   onEdit: (row: object) => void,
 *   onDelete: (row: object) => void | Promise<void>,
 *   showSnackbar: (message: string, severity?: string) => void,
 * }} props
 */
export function TimesheetMyReportView({
  initialDate,
  onBack,
  onEdit,
  onDelete,
  showSnackbar,
}) {
  const minPickerDate = dayjs().startOf('year');
  const maxPickerDate = dayjs();

  const [rangeFrom, setRangeFrom] = useState(() =>
    initialDate ? dayjs(initialDate) : null,
  );
  const [rangeTo, setRangeTo] = useState(() => (initialDate ? dayjs(initialDate) : null));

  const showAllRecords = !rangeFrom && !rangeTo;

  const queryRange = useMemo(() => {
    if (showAllRecords) return defaultAllRange();
    const fromDay = rangeFrom ?? rangeTo;
    const toDay = rangeTo ?? rangeFrom;
    if (!fromDay || !toDay) return null;
    let from = fromDay.format('YYYY-MM-DD');
    let to = toDay.format('YYYY-MM-DD');
    if (from > to) [from, to] = [to, from];
    return { from, to };
  }, [showAllRecords, rangeFrom, rangeTo]);

  const isSingleDay =
    !showAllRecords &&
    rangeFrom &&
    rangeTo &&
    rangeFrom.format('YYYY-MM-DD') === rangeTo.format('YYYY-MM-DD');

  const showDateColumn = showAllRecords || !isSingleDay;

  const { data: dayMeta } = useTimesheetDay(isSingleDay ? queryRange?.from : '');
  const { data, isLoading, error, refetch, isFetching } = useTimesheetReportEntries(
    queryRange || defaultAllRange(),
  );
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState('all');
  const [page, setPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [orderBy, setOrderBy] = useState(showAllRecords ? 'workDate' : 'category');
  const [order, setOrder] = useState(showAllRecords ? 'desc' : 'asc');

  const rangeFilterKey = showAllRecords
    ? 'all'
    : `${queryRange?.from ?? ''}-${queryRange?.to ?? ''}`;

  useEffect(() => {
    setPage(0);
    setSearch('');
    if (showAllRecords) {
      setOrderBy('workDate');
      setOrder('desc');
    }
  }, [rangeFilterKey, showAllRecords]);

  const handleFromChange = (d) => {
    if (!d) return;
    setRangeFrom(d);
    if (!rangeTo || d.isAfter(rangeTo, 'day')) setRangeTo(d);
  };

  const handleToChange = (d) => {
    if (!d) return;
    setRangeTo(d);
    if (!rangeFrom || d.isBefore(rangeFrom, 'day')) setRangeFrom(d);
  };

  const handleClearRange = () => {
    setRangeFrom(null);
    setRangeTo(null);
  };

  const rangeLabel = showAllRecords
    ? `All records (${dayjs(queryRange?.from).format('MMM DD, YYYY')} – ${dayjs(queryRange?.to).format('MMM DD, YYYY')})`
    : isSingleDay
      ? rangeFrom.format('MMM DD, YYYY')
      : `${dayjs(queryRange?.from).format('MMM DD, YYYY')} – ${dayjs(queryRange?.to).format('MMM DD, YYYY')}`;

  const exportSlug = showAllRecords
    ? `all-${queryRange?.from}-to-${queryRange?.to}`
    : `${queryRange?.from}-to-${queryRange?.to}`;

  const flatRows = useMemo(() => {
    return (data?.rows ?? []).map((row) => {
      const display = apiEntryToDisplay(row.entry);
      return {
        ...row,
        entryId: row.entry.id,
        categoryLabel: display.categoryName || '—',
        workAreaDescription: display.workAreaDescription,
        hoursSpent: display.hoursSpent,
        refNumber: display.refNumber ?? '',
        dateLabel: dayjs(row.workDate).format('MMM DD, YYYY'),
        canModify: row.editable || row.canReopen,
      };
    });
  }, [data?.rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flatRows;
    return flatRows.filter((row) => {
      const haystack = [
        row.dateLabel,
        row.categoryLabel,
        row.workAreaDescription,
        String(row.hoursSpent),
        row.refNumber,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [flatRows, search]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    rows.sort((a, b) => {
      let av;
      let bv;
      switch (orderBy) {
        case 'category':
          av = a.categoryLabel;
          bv = b.categoryLabel;
          break;
        case 'workAreaDescription':
          av = a.workAreaDescription;
          bv = b.workAreaDescription;
          break;
        case 'hoursSpent':
          av = a.hoursSpent;
          bv = b.hoursSpent;
          break;
        case 'refNumber':
          av = a.refNumber;
          bv = b.refNumber;
          break;
        default:
          av = a.workDate;
          bv = b.workDate;
      }
      return compareValues(av, bv, order);
    });
    return rows;
  }, [filtered, order, orderBy]);

  const totalPages =
    pageSize === 'all' ? 1 : Math.max(1, Math.ceil(sorted.length / Number(pageSize)));
  const paged = useMemo(() => {
    if (pageSize === 'all') return sorted;
    const size = Number(pageSize);
    const start = page * size;
    return sorted.slice(start, start + size);
  }, [sorted, page, pageSize]);

  const exportMatrix = useMemo(
    () =>
      reportRowsToMatrix(
        sorted.map((r) => ({
          workDate: r.dateLabel,
          categoryLabel: r.categoryLabel,
          workAreaDescription: r.workAreaDescription,
          hoursSpent: r.hoursSpent,
          refNumber: r.refNumber,
        })),
      ),
    [sorted],
  );

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
    setPage(0);
  };

  const handleExportCopy = async () => {
    try {
      await copyReportToClipboard(exportMatrix);
      showSnackbar('Copied to clipboard');
    } catch {
      showSnackbar('Could not copy to clipboard', 'error');
    }
  };

  const handleExportCsv = () => {
    downloadTextFile(
      `timesheet-report-${exportSlug}.csv`,
      matrixToCsv(exportMatrix),
      'text/csv;charset=utf-8',
    );
    showSnackbar('CSV downloaded');
  };

  const handleExportExcel = () => {
    downloadTextFile(
      `timesheet-report-${exportSlug}.xls`,
      matrixToCsv(exportMatrix),
      'application/vnd.ms-excel;charset=utf-8',
    );
    showSnackbar('Excel file downloaded');
  };

  const handleExportPdf = () => {
    printReportAsPdf(exportMatrix, `Timesheet — ${rangeLabel}`);
  };

  const sortableHead = (id, label, align = 'left') => (
    <TableCell align={align} sortDirection={orderBy === id ? order : false}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : 'asc'}
        onClick={() => handleSort(id)}
      >
        <strong>{label}</strong>
      </TableSortLabel>
    </TableCell>
  );

  const tableContent = (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            Show
          </Typography>
          <FormControl size="small" sx={{ minWidth: 72 }}>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                setPage(0);
              }}
            >
              {PAGE_SIZES.map((opt) => (
                <MenuItem key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            entries
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ ml: { md: 1 } }}>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={handleExportCopy} sx={{ bgcolor: 'warning.light' }}>
                <ContentCopyRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excel">
              <IconButton size="small" onClick={handleExportExcel} sx={{ bgcolor: 'success.light' }}>
                <TableChartRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="CSV">
              <IconButton size="small" onClick={handleExportCsv} sx={{ bgcolor: 'success.light' }}>
                <Typography variant="caption" fontWeight={700}>
                  CSV
                </Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="PDF">
              <IconButton size="small" onClick={handleExportPdf} sx={{ bgcolor: 'error.light' }}>
                <PictureAsPdfRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ maxWidth: 280, width: '100%' }}
        />
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error.message}
        </Alert>
      ) : (
        <>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  {showDateColumn ? sortableHead('workDate', 'Date') : null}
                  {sortableHead('category', 'Category')}
                  {sortableHead('workAreaDescription', 'Work Area/Description')}
                  {sortableHead('hoursSpent', 'Hours', 'right')}
                  {sortableHead('refNumber', 'Ref #')}
                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showDateColumn ? 6 : 5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No entries for {rangeLabel}.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row, index) => (
                    <TableRow
                      key={`${row.workDate}-${row.entryId}`}
                      sx={{
                        bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50',
                        '& td': { borderBottom: '1px solid', borderColor: 'divider' },
                      }}
                    >
                      {showDateColumn ? <TableCell>{row.dateLabel}</TableCell> : null}
                      <TableCell>{row.categoryLabel}</TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
                          {row.workAreaDescription}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{Number(row.hoursSpent).toFixed(0)}</TableCell>
                      <TableCell>{row.refNumber || ''}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => onEdit(row)}
                            disabled={!row.canModify}
                            sx={{ minWidth: 72, textTransform: 'none', py: 0.25 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => onDelete(row)}
                            disabled={!row.canModify}
                            sx={{ minWidth: 84, textTransform: 'none', py: 0.25 }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {paged.length} of {sorted.length} entries
              {data?.totalHours != null ? ` · ${Number(data.totalHours).toFixed(1)}h total` : ''}
            </Typography>
            {pageSize !== 'all' && sorted.length > Number(pageSize) ? (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  Page {page + 1} of {totalPages}
                </Typography>
                <Button
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </>
      )}
    </>
  );

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack} variant="text">
            Back to timesheet
          </Button>
          <Typography variant="h5" fontWeight={700}>
            My Report
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <DatePicker
            label="From date"
            value={rangeFrom}
            onChange={handleFromChange}
            minDate={minPickerDate}
            maxDate={rangeTo ?? maxPickerDate}
            slotProps={{
              textField: { size: 'small', sx: { minWidth: 150 } },
            }}
          />
          <DatePicker
            label="To date"
            value={rangeTo}
            onChange={handleToChange}
            minDate={rangeFrom ?? minPickerDate}
            maxDate={maxPickerDate}
            slotProps={{
              textField: { size: 'small', sx: { minWidth: 150 } },
            }}
          />
          <Button
            variant="text"
            color="secondary"
            startIcon={<ClearAllRoundedIcon />}
            onClick={handleClearRange}
            disabled={showAllRecords}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
          <Tooltip title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton onClick={() => setFullscreen((v) => !v)}>
              {fullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        flexWrap="wrap"
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          {showAllRecords ? (
            <>
              Showing <strong>all records</strong> for the current year
            </>
          ) : (
            <>
              Showing entries from <strong>{rangeLabel}</strong>
            </>
          )}
        </Typography>
        {isSingleDay ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <TimesheetStatusChip
              status={dayMeta?.isMissing ? 'MISSING' : dayMeta?.status}
              size="small"
            />
            <Typography variant="body2" fontWeight={600}>
              {Number(dayMeta?.totalHours ?? data?.totalHours ?? 0).toFixed(1)}h logged
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" fontWeight={600}>
            {Number(data?.totalHours ?? 0).toFixed(1)}h total
            {data?.totalEntries != null ? ` · ${data.totalEntries} entries` : ''}
          </Typography>
        )}
      </Stack>

      <PageCard
        sx={
          fullscreen
            ? {
                position: 'fixed',
                inset: 16,
                zIndex: (theme) => theme.zIndex.modal,
                m: 0,
                overflow: 'auto',
                maxHeight: 'calc(100vh - 32px)',
              }
            : undefined
        }
      >
        {tableContent}
      </PageCard>
    </Box>
  );
}
