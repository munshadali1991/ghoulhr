import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Chip,
  CircularProgress,
  Drawer,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { EmptyStatePanel } from '@/features/employee-portal/components/EmptyStatePanel';
import { TimesheetSummaryCards } from '@/features/employee-portal/components/timesheet/TimesheetSummaryCards';
import { TimesheetApprovalDetailPanel } from '../../components/TimesheetApprovalDetailPanel';
import { TimesheetApprovalToolbar } from '../../components/timesheet/TimesheetApprovalToolbar';
import { TimesheetEmployeeSummaryCard } from '../../components/timesheet/TimesheetEmployeeSummaryCard';
import { TimesheetTeamDataTable } from '../../components/timesheet/TimesheetTeamDataTable';
import { TimesheetBulkApproveBar } from '../../components/timesheet/TimesheetBulkApproveBar';
import { BulkApproveTimesheetDialog } from '../../components/timesheet/BulkApproveTimesheetDialog';
import { useBulkApproveTimesheets, useTeamTimesheetDays } from '../../hooks/useApprovalsQueries';
import { getTeamTimesheetRowKey, isPlaceholderRowKey } from '../../utils/teamTimesheetRowKey';

function currentMonthRange() {
  const now = dayjs();
  return {
    from: now.startOf('month').format('YYYY-MM-DD'),
    to: now.endOf('month').format('YYYY-MM-DD'),
  };
}

function presetRange(preset) {
  const now = dayjs();
  if (preset === 'week') {
    return {
      from: now.startOf('week').format('YYYY-MM-DD'),
      to: now.format('YYYY-MM-DD'),
    };
  }
  if (preset === 'lastMonth') {
    const last = now.subtract(1, 'month');
    return {
      from: last.startOf('month').format('YYYY-MM-DD'),
      to: last.endOf('month').format('YYYY-MM-DD'),
    };
  }
  return currentMonthRange();
}

export function TeamTimesheetsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const { snackbar, show, close } = useAppSnackbar();

  const defaultRange = useMemo(() => currentMonthRange(), []);
  const from = searchParams.get('from') || defaultRange.from;
  const to = searchParams.get('to') || defaultRange.to;
  const status = searchParams.get('status') ?? 'SUBMITTED';
  const employeeId = searchParams.get('employeeId') || '';

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState('selected');

  const updateParams = useCallback(
    (patch) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  const queryParams = useMemo(
    () => ({
      from,
      to,
      status: status || undefined,
      employeeId: employeeId || undefined,
    }),
    [from, to, status, employeeId],
  );

  const teamQuery = useTeamTimesheetDays(queryParams);
  const employeeRangeQuery = useTeamTimesheetDays(
    { from, to, employeeId: employeeId || undefined },
    { enabled: Boolean(employeeId) },
  );
  const bulkMutation = useBulkApproveTimesheets();

  const days = teamQuery.data?.days ?? [];
  const employees = teamQuery.data?.employees ?? [];
  const pendingCount = teamQuery.data?.pendingCount ?? 0;
  const submittedCount = teamQuery.data?.submittedCount ?? 0;

  const actionableRows = useMemo(() => days.filter((d) => d.canAct && d.id), [days]);
  const pendingInViewCount = actionableRows.length;

  const selectedEmployee = useMemo(() => {
    if (!employeeId) return null;
    return employees.find((e) => e.id === employeeId) ?? null;
  }, [employeeId, employees]);

  const employeeStats = useMemo(() => {
    if (!employeeId || !employeeRangeQuery.data) return null;
    const empDays = employeeRangeQuery.data.days ?? [];
    const summary = { PENDING: 0, SUBMITTED: 0, APPROVED: 0, REJECTED: 0 };
    let hours = 0;
    let notSubmitted = 0;
    for (const d of empDays) {
      hours += Number(d.totalHours);
      summary[d.status] = (summary[d.status] ?? 0) + 1;
      if (d.status === 'PENDING') notSubmitted += 1;
    }
    return {
      totalDays: empDays.length,
      totalHours: hours,
      pendingCount: notSubmitted,
      statusSummary: summary,
    };
  }, [employeeId, employeeRangeQuery.data]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [from, to, status, employeeId]);

  useEffect(() => {
    if (!employeeId) return;
    if (!employees.some((e) => e.id === employeeId)) {
      updateParams({ employeeId: '' });
    }
  }, [employees, employeeId, updateParams]);

  const toggleRow = (row) => {
    if (!row.id) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  };

  const toggleAllActionable = () => {
    const allSelected = actionableRows.every((r) => selectedIds.has(r.id));
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(actionableRows.map((r) => r.id)));
  };

  const handleRowClick = (rowKey) => {
    setSelectedRowId(rowKey);
    if (isMobile) setMobileDrawerOpen(true);
  };

  const handleActionComplete = () => {
    setSelectedIds(new Set());
    setSelectedRowId(null);
    if (isMobile) setMobileDrawerOpen(false);
  };

  const openBulkDialog = (mode) => {
    setBulkMode(mode);
    setBulkDialogOpen(true);
  };

  const bulkCount = bulkMode === 'selected' ? selectedIds.size : pendingInViewCount;

  const handleBulkConfirm = async () => {
    try {
      let result;
      if (bulkMode === 'selected') {
        result = await bulkMutation.mutateAsync({ ids: [...selectedIds] });
      } else {
        result = await bulkMutation.mutateAsync({
          from,
          to,
          employeeId: employeeId || undefined,
        });
      }
      setBulkDialogOpen(false);
      setSelectedIds(new Set());
      const { approvedCount, failures } = result ?? {};
      if (failures?.length) {
        show(`Approved ${approvedCount}; ${failures.length} could not be approved`, 'warning');
      } else {
        show(`Approved ${approvedCount} timesheet(s)`, 'success');
      }
      teamQuery.refetch();
    } catch (e) {
      show(e?.message ?? 'Bulk approve failed', 'error');
    }
  };

  const selectedRow = useMemo(
    () => days.find((d) => getTeamTimesheetRowKey(d) === selectedRowId) ?? null,
    [days, selectedRowId],
  );

  const detailPanel =
    selectedRowId && selectedRow && isPlaceholderRowKey(selectedRowId) ? (
      <EmptyStatePanel
        title="Not submitted yet"
        description={`${selectedRow.employeeName} has not submitted a timesheet for ${dayjs(selectedRow.workDate).format('DD MMM YYYY')}.`}
      />
    ) : selectedRowId && selectedRow?.id ? (
      <TimesheetApprovalDetailPanel
        key={selectedRow.id}
        requestId={selectedRow.id}
        onActionComplete={handleActionComplete}
        onSuccess={show}
        onError={(msg) => show(msg, 'error')}
      />
    ) : (
      <EmptyStatePanel
        title="Select a timesheet"
        description="Choose a row to review employee details and entries."
      />
    );

  return (
    <>
      <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Team Timesheets
          </Typography>
          {submittedCount > 0 ? (
            <Badge badgeContent={submittedCount} color="info">
              <Chip label="Awaiting approval" size="small" color="info" variant="outlined" />
            </Badge>
          ) : null}
        </Stack>

        <TimesheetApprovalToolbar
          from={from}
          to={to}
          status={status}
          employeeId={employeeId}
          employees={employees}
          submittedCount={submittedCount}
          onFromChange={(value) => updateParams({ from: value })}
          onToChange={(value) => updateParams({ to: value })}
          onStatusChange={(value) => updateParams({ status: value || undefined })}
          onEmployeeChange={(value) => updateParams({ employeeId: value || undefined })}
          onPreset={(preset) => {
            const range = presetRange(preset);
            updateParams({ from: range.from, to: range.to });
          }}
        />

        {teamQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : teamQuery.error ? (
          <Alert severity="error">{teamQuery.error.message}</Alert>
        ) : (
          <>
            <TimesheetSummaryCards
              totalHours={teamQuery.data?.totalHours ?? 0}
              statusSummary={teamQuery.data?.statusSummary ?? {}}
              submittedCount={submittedCount}
            />

            {selectedEmployee && employeeStats ? (
              <TimesheetEmployeeSummaryCard
                employee={selectedEmployee}
                totalDays={employeeStats.totalDays}
                totalHours={employeeStats.totalHours}
                pendingCount={employeeStats.pendingCount}
                statusSummary={employeeStats.statusSummary}
              />
            ) : null}

            <TimesheetBulkApproveBar
              selectedCount={selectedIds.size}
              pendingInViewCount={pendingInViewCount}
              isPending={bulkMutation.isPending}
              onApproveSelected={() => openBulkDialog('selected')}
              onApproveAllPending={() => openBulkDialog('range')}
            />

            {days.length === 0 ? (
              <EmptyStatePanel
                title="No timesheets found"
                description="Try adjusting the date range or filters."
              />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: selectedRowId && !isMobile ? 7 : 12 }}>
                  <TimesheetTeamDataTable
                    rows={days}
                    selectedIds={selectedIds}
                    selectedRowId={selectedRowId}
                    onToggleRow={toggleRow}
                    onToggleAllActionable={toggleAllActionable}
                    onRowClick={handleRowClick}
                    showEmployeeColumn={!employeeId}
                  />
                </Grid>
                {!isMobile && selectedRowId ? (
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ position: 'sticky', top: 16 }}>{detailPanel}</Box>
                  </Grid>
                ) : null}
              </Grid>
            )}
          </>
        )}
      </Box>

      <Drawer
        anchor="bottom"
        open={isMobile && mobileDrawerOpen && Boolean(selectedRowId)}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '92vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
          },
        }}
      >
        {selectedRowId && selectedRow?.id ? (
          <TimesheetApprovalDetailPanel
            key={selectedRow.id}
            requestId={selectedRow.id}
            onActionComplete={() => {
              setMobileDrawerOpen(false);
              handleActionComplete();
            }}
            onSuccess={show}
            onError={(msg) => show(msg, 'error')}
          />
        ) : selectedRowId && selectedRow && isPlaceholderRowKey(selectedRowId) ? (
          <EmptyStatePanel
            title="Not submitted yet"
            description={`${selectedRow.employeeName} has not submitted a timesheet for ${dayjs(selectedRow.workDate).format('DD MMM YYYY')}.`}
          />
        ) : null}
      </Drawer>

      <BulkApproveTimesheetDialog
        open={bulkDialogOpen}
        count={bulkCount}
        mode={bulkMode}
        from={from}
        to={to}
        employeeName={selectedEmployee?.name}
        isPending={bulkMutation.isPending}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkDialogOpen(false)}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </>
  );
}
