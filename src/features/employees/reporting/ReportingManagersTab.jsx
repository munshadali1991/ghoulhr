import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import {
  listReportingManagers,
  removeReportingManager,
} from '@/features/employees/api/reportingManagersApi';
import { listEmployees } from '@/features/employees/api/employeesApi';
import { AssignManagerDialog } from './AssignManagerDialog';

/**
 * @param {{ showSnackbar: (msg: string, severity?: string) => void }} props
 */
export function ReportingManagersTab({ showSnackbar }) {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState(null);
  const [bulkTargets, setBulkTargets] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const [data, empList] = await Promise.all([
        listReportingManagers({ search, filter }),
        listEmployees(),
      ]);
      setRows(Array.isArray(data) ? data : []);
      setEmployees(Array.isArray(empList) ? empList : []);
    } catch (e) {
      showSnackbar(e.message || 'Failed to load reporting managers', 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, filter, showSnackbar]);

  useEffect(() => {
    const t = setTimeout(() => fetchRows(), 300);
    return () => clearTimeout(t);
  }, [fetchRows]);

  useEffect(() => {
    clearSelection();
  }, [filter, search, clearSelection]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.employeeId));
  const someVisibleSelected = rows.some((r) => selectedIds.has(r.employeeId));

  const toggleRow = (employeeId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      clearSelection();
      return;
    }
    setSelectedIds(new Set(rows.map((r) => r.employeeId)));
  };

  const openAssign = (row = null) => {
    setBulkTargets(null);
    if (row) {
      setDialogTarget({
        employee: {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          employeeCode: row.employeeCode,
        },
        manager: row.manager,
      });
    } else {
      setDialogTarget(null);
    }
    setDialogOpen(true);
  };

  const openBulkAssign = () => {
    const selected = rows
      .filter((r) => selectedIds.has(r.employeeId))
      .map((r) => ({
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        employeeCode: r.employeeCode,
      }));
    setBulkTargets(selected);
    setDialogTarget(null);
    setDialogOpen(true);
  };

  const handleAssignManagerClick = () => {
    if (selectedCount > 0) {
      openBulkAssign();
    } else {
      openAssign();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setBulkTargets(null);
  };

  const handleDialogSuccess = ({ succeededCount = 1, failedCount = 0 } = {}) => {
    clearSelection();
    setBulkTargets(null);
    fetchRows();
    if (failedCount > 0) {
      showSnackbar(
        `Saved for ${succeededCount} employee(s); ${failedCount} failed`,
        'warning',
      );
    } else if (succeededCount > 1) {
      showSnackbar(`Reporting manager saved for ${succeededCount} employees`, 'success');
    } else {
      showSnackbar('Reporting manager saved', 'success');
    }
  };

  const handleRemove = async (row) => {
    if (!window.confirm(`Remove reporting manager for ${row.employeeName}?`)) return;
    try {
      await removeReportingManager(row.employeeId);
      showSnackbar('Reporting manager removed', 'success');
      fetchRows();
    } catch (e) {
      showSnackbar(e.message || 'Failed to remove reporting manager', 'error');
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip
            label="All"
            color={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Unassigned"
            color={filter === 'unassigned' ? 'primary' : 'default'}
            onClick={() => setFilter('unassigned')}
            variant={filter === 'unassigned' ? 'filled' : 'outlined'}
          />
          {selectedCount > 0 ? (
            <>
              <Chip
                label={`${selectedCount} employee${selectedCount === 1 ? '' : 's'} selected`}
                color="primary"
                variant="outlined"
              />
              <Button size="small" onClick={clearSelection}>
                Clear
              </Button>
            </>
          ) : null}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchRows}
            disabled={loading}
          >
            Refresh
          </Button>
          <BrandedButton
            startIcon={<PersonAddRoundedIcon />}
            onClick={handleAssignManagerClick}
          >
            Assign manager
          </BrandedButton>
        </Stack>
      </Stack>

      <PageCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search employee or manager…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </PageCard>

      <PageCard>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    disabled={loading || rows.length === 0}
                    inputProps={{ 'aria-label': 'Select all employees' }}
                  />
                </TableCell>
                <TableCell>
                  <strong>Employee</strong>
                </TableCell>
                <TableCell>
                  <strong>Code</strong>
                </TableCell>
                <TableCell>
                  <strong>Department</strong>
                </TableCell>
                <TableCell>
                  <strong>Reporting manager</strong>
                </TableCell>
                <TableCell>
                  <strong>Effective from</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {filter === 'unassigned'
                        ? 'All employees have a reporting manager assigned'
                        : 'No employees match your search'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.employeeId}
                    hover
                    selected={selectedIds.has(row.employeeId)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.has(row.employeeId)}
                        onChange={() => toggleRow(row.employeeId)}
                        inputProps={{
                          'aria-label': `Select ${row.employeeName}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{row.employeeCode}</TableCell>
                    <TableCell>{row.departmentName || '—'}</TableCell>
                    <TableCell>
                      {row.manager ? (
                        `${row.manager.name} (${row.manager.employeeCode})`
                      ) : (
                        <Chip label="Unassigned" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {row.effectiveFrom
                        ? new Date(row.effectiveFrom).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => openAssign(row)}>
                          {row.manager ? 'Change' : 'Assign'}
                        </Button>
                        {row.manager ? (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemove(row)}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>

      <AssignManagerDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        employees={employees}
        selectedEmployees={bulkTargets}
        initialEmployee={dialogTarget?.employee ?? null}
        initialManager={dialogTarget?.manager ?? null}
      />
    </Box>
  );
}
