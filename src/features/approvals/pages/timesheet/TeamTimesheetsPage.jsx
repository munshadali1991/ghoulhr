import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
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
import { TimesheetTeamDataTable } from '../../components/timesheet/TimesheetTeamDataTable';
import { useTeamTimesheetDays } from '../../hooks/useApprovalsQueries';
import { getTeamTimesheetRowKey } from '../../utils/teamTimesheetRowKey';

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

function matchesEmployeeSearch(row, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const name = String(row.employeeName ?? '').toLowerCase();
  const code = String(row.employeeCode ?? '').toLowerCase();
  return name.includes(q) || code.includes(q);
}

export function TeamTimesheetsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const { snackbar, show, close } = useAppSnackbar();

  const defaultRange = useMemo(() => currentMonthRange(), []);
  const from = searchParams.get('from') || defaultRange.from;
  const to = searchParams.get('to') || defaultRange.to;

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
        next.delete('status');
        next.delete('employeeId');
        return next;
      });
    },
    [setSearchParams],
  );

  const queryParams = useMemo(
    () => ({
      from,
      to,
      status: 'SUBMITTED',
    }),
    [from, to],
  );

  const teamQuery = useTeamTimesheetDays(queryParams);

  const days = useMemo(() => {
    const allDays = teamQuery.data?.days ?? [];
    return allDays.filter((row) => matchesEmployeeSearch(row, employeeSearch));
  }, [teamQuery.data?.days, employeeSearch]);

  const submittedCount = days.length;
  const totalHours = useMemo(
    () => days.reduce((sum, row) => sum + Number(row.totalHours ?? 0), 0),
    [days],
  );

  useEffect(() => {
    setSelectedRowId(null);
  }, [from, to, employeeSearch]);

  const handleRowClick = (rowKey) => {
    setSelectedRowId(rowKey);
    if (isMobile) setMobileDrawerOpen(true);
  };

  const selectedRow = useMemo(
    () => days.find((d) => getTeamTimesheetRowKey(d) === selectedRowId) ?? null,
    [days, selectedRowId],
  );

  const detailPanel =
    selectedRowId && selectedRow?.id ? (
      <TimesheetApprovalDetailPanel
        key={selectedRow.id}
        requestId={selectedRow.id}
        readOnly
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
        </Stack>

        <TimesheetApprovalToolbar
          from={from}
          to={to}
          employeeSearch={employeeSearch}
          onFromChange={(value) => updateParams({ from: value })}
          onToChange={(value) => updateParams({ to: value })}
          onEmployeeSearchChange={setEmployeeSearch}
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
            <TimesheetSummaryCards totalHours={totalHours} submittedCount={submittedCount} />

            {days.length === 0 ? (
              <EmptyStatePanel
                title="No timesheets found"
                description={
                  employeeSearch.trim()
                    ? 'No submitted timesheets match your search.'
                    : 'Try adjusting the date range or filters.'
                }
              />
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: selectedRowId && !isMobile ? 7 : 12 }}>
                  <TimesheetTeamDataTable
                    rows={days}
                    selectedRowId={selectedRowId}
                    onRowClick={handleRowClick}
                    showEmployeeColumn
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
            readOnly
            onSuccess={show}
            onError={(msg) => show(msg, 'error')}
          />
        ) : null}
      </Drawer>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </>
  );
}
