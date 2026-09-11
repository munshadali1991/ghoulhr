import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { PageToolbar } from '../../components/PageToolbar';
import { EmployeeSwipeDetailPanel } from '../../components/attendance/EmployeeSwipeDetailPanel';
import { useEmployeeSwipes } from '../../hooks/useEmployeePortalQueries';
import { downloadEmployeeSwipesCsv } from '../../api/employeePortalApi';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { formatEmployeeCode } from '../../utils/displayFormat';

const MAX_RANGE_DAYS = 31;

function dash(value) {
  if (value == null || value === '') return '—';
  return value;
}

/**
 * Attendance → Employee Swipes (scoped punch history).
 */
export function EmployeeSwipesPage() {
  const { can } = useAuthorization();
  const allowed = can('ess.attendance.swipes:read');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { snackbar, show, close } = useAppSnackbar();

  const defaultTo = dayjs().format('YYYY-MM-DD');
  const defaultFrom = dayjs().subtract(19, 'day').format('YYYY-MM-DD');

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [punchType, setPunchType] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [exporting, setExporting] = useState(false);

  const rangeError = useMemo(() => {
    if (dayjs(to).isBefore(dayjs(from))) {
      return 'To date must be on or after From date';
    }
    if (dayjs(to).diff(dayjs(from), 'day') + 1 > MAX_RANGE_DAYS) {
      return `Range cannot exceed ${MAX_RANGE_DAYS} days`;
    }
    return null;
  }, [from, to]);

  const queryParams = useMemo(
    () =>
      rangeError
        ? null
        : {
            from,
            to,
            q: q || undefined,
            punchType: punchType || undefined,
            page: page + 1,
            pageSize,
          },
    [from, to, q, punchType, page, pageSize, rangeError],
  );

  const query = useEmployeeSwipes(queryParams, allowed && !rangeError);
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const selected = items.find((r) => r.id === selectedId) ?? null;

  const applySearch = () => {
    setPage(0);
    setQ(searchInput.trim());
  };

  const handleRowClick = (row) => {
    setSelectedId(row.id);
    if (isMobile) setMobileDrawerOpen(true);
  };

  const handleExport = async () => {
    if (rangeError || !from || !to) return;
    setExporting(true);
    try {
      await downloadEmployeeSwipesCsv({
        from,
        to,
        q: q || undefined,
        punchType: punchType || undefined,
      });
      show('CSV downloaded');
    } catch (e) {
      show(e?.message ?? 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!allowed) {
    return <Alert severity="warning">You do not have access to Employee Swipes.</Alert>;
  }

  const detail = <EmployeeSwipeDetailPanel swipe={selected} />;

  return (
    <Box>
      <PageToolbar title="Employee Swipes" />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ md: 'center' }}
        sx={{ mb: 2 }}
        flexWrap="wrap"
        useFlexGap
      >
        <TextField
          label="From"
          type="date"
          size="small"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small"
          placeholder="Search Employee"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applySearch();
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label="Download CSV"
            onClick={handleExport}
            disabled={Boolean(rangeError) || exporting}
          >
            <DownloadRoundedIcon />
          </IconButton>
          <IconButton
            aria-label="Filter"
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            <FilterListRoundedIcon />
          </IconButton>
        </Stack>
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
        >
          <MenuItem
            selected={!punchType}
            onClick={() => {
              setPunchType('');
              setPage(0);
              setFilterAnchor(null);
            }}
          >
            All punches
          </MenuItem>
          <MenuItem
            selected={punchType === 'IN'}
            onClick={() => {
              setPunchType('IN');
              setPage(0);
              setFilterAnchor(null);
            }}
          >
            Sign in only
          </MenuItem>
          <MenuItem
            selected={punchType === 'OUT'}
            onClick={() => {
              setPunchType('OUT');
              setPage(0);
              setFilterAnchor(null);
            }}
          >
            Sign out only
          </MenuItem>
        </Menu>
      </Stack>

      {rangeError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rangeError}
        </Alert>
      ) : null}

      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <PageCard sx={{ p: 0, overflow: 'hidden', minHeight: 320 }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Swipe Time &amp; Date</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Received On</TableCell>
                    <TableCell>Door/Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 3, textAlign: 'center' }}
                        >
                          No swipes in this range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => {
                      const codeLabel = formatEmployeeCode(row.employeeCode);
                      return (
                      <TableRow
                        key={row.id}
                        hover
                        selected={row.id === selectedId}
                        onClick={() => handleRowClick(row)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              m: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={row.name || undefined}
                          >
                            {row.name || 'Employee'}
                          </Typography>
                          {codeLabel ? (
                            <Typography variant="caption" color="text.secondary">
                              {codeLabel}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
                            {dash(row.swipeTime)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dash(row.swipeDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>{dash(row.shiftName)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
                            {dash(row.receivedTime)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dash(row.receivedDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>{dash(row.doorAddress)}</TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[25, 50, 100]}
            />
          </PageCard>

          {!isMobile ? <Box sx={{ minWidth: 0 }}>{detail}</Box> : null}
        </Box>
      )}

      <Drawer
        anchor="bottom"
        open={isMobile && mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{ sx: { maxHeight: '70vh', borderTopLeftRadius: 12, borderTopRightRadius: 12 } }}
      >
        <Box sx={{ p: 1 }}>{detail}</Box>
      </Drawer>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Box>
  );
}
