import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { TimesheetInlineEntryRow } from '../../components/timesheet/TimesheetInlineEntryRow';
import { TimesheetMyReportView } from '../../components/timesheet/TimesheetMyReportView';
import { TimesheetStatusChip } from '../../components/timesheet/TimesheetStatusChip';
import { fetchTimesheetDay } from '../../api/timesheetApi';
import { DEFAULT_INLINE_ROW, PRIORITIES, TASK_STATUSES } from '../../constants/timesheetEnums';
import { timesheetInlineRowSchema } from '../../schemas/timesheetEntrySchema';
import {
  useReopenTimesheetDay,
  useTimesheetCategories,
  useTimesheetDay,
  useUpsertTimesheetDay,
} from '../../hooks/useEmployeePortalQueries';
import {
  apiEntryToDisplay,
  serializeEntriesForApi,
} from '../../utils/timesheetEntryMappers';

function sumHours(entries) {
  return entries.reduce((acc, e) => acc + Number(e.hoursSpent || 0), 0);
}

function entryKey(entry) {
  return entry.id ?? entry._localId;
}

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function createEmptyDraftRow(workDate, categoryId) {
  return {
    ...DEFAULT_INLINE_ROW,
    workDate,
    categoryId,
    _draftId: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
}

function isDraftRowEmpty(row) {
  return !String(row.workAreaDescription ?? '').trim() && !Number(row.hoursSpent);
}

function enrichWithCategory(row, categories) {
  const cat = categories.find((c) => c.id === row.categoryId);
  return { ...row, categoryName: cat?.name ?? row.categoryName ?? '' };
}

export function TimesheetDayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const selectedDate = useMemo(
    () => (dateParam ? dayjs(dateParam) : dayjs()),
    [dateParam],
  );
  const workDate = selectedDate.format('YYYY-MM-DD');

  const { data, isLoading, error, refetch } = useTimesheetDay(workDate);
  const { data: categoriesData } = useTimesheetCategories();
  const categories = categoriesData?.categories ?? [];
  const defaultCategoryId = categories[0]?.id ?? '';
  const upsertMutation = useUpsertTimesheetDay();
  const reopenMutation = useReopenTimesheetDay();
  const { snackbar, show, close } = useAppSnackbar();

  const [entries, setEntries] = useState([]);
  const [draftRows, setDraftRows] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [draftErrors, setDraftErrors] = useState({});
  const [showMyReport, setShowMyReport] = useState(false);
  const [pendingEditEntryId, setPendingEditEntryId] = useState(null);

  const maxHours = data?.settings?.maxHoursPerDay ?? 12;
  const maxPastDays = data?.settings?.maxPastDays ?? 7;
  const minDate = dayjs().subtract(maxPastDays, 'day');
  const maxDate = dayjs();
  const isEditable = Boolean(data?.editable);
  const canReopen = Boolean(data?.canReopen);
  const totalHours = sumHours(entries);
  const overLimit = totalHours > maxHours;

  useEffect(() => {
    if (data) {
      setEntries(
        (data.entries ?? []).map((e, i) => ({
          ...apiEntryToDisplay(e),
          _localId: e.id ?? `row-${i}`,
        })),
      );
    }
  }, [data]);

  useEffect(() => {
    if (editingKey) return;
    setDraftRows([createEmptyDraftRow(workDate, defaultCategoryId)]);
    setDraftErrors({});
  }, [workDate, editingKey, defaultCategoryId]);

  useEffect(() => {
    if (editingKey || !defaultCategoryId) return;
    setDraftRows((rows) =>
      rows.map((row) => (row.categoryId ? row : { ...row, categoryId: defaultCategoryId })),
    );
  }, [defaultCategoryId, editingKey]);

  useEffect(() => {
    if (!pendingEditEntryId || !data?.entries) return;
    const entry = data.entries.find((e) => e.id === pendingEditEntryId);
    if (entry) {
      loadEntryIntoDrafts({ ...apiEntryToDisplay(entry), id: entry.id }, workDate);
      setPendingEditEntryId(null);
    }
  }, [data, pendingEditEntryId, workDate]);

  const handleDraftChange = (draftId, next) => {
    setDraftRows((rows) => rows.map((row) => (row._draftId === draftId ? next : row)));
    if (next.workDate && next.workDate !== workDate) {
      setSearchParams({ date: next.workDate });
    }
  };

  const loadEntryIntoDrafts = (entry, dateOverride) => {
    const display = apiEntryToDisplay(entry);
    const date = dateOverride ?? workDate;
    setDraftRows([
      {
        workDate: date,
        categoryId: display.categoryId,
        workAreaDescription: display.workAreaDescription,
        hoursSpent: display.hoursSpent,
        taskStatus: display.taskStatus,
        priority: display.priority,
        refNumber: display.refNumber ?? '',
        _draftId: `draft-edit-${entryKey(entry)}`,
      },
    ]);
    setEditingKey(entryKey(entry));
    setDraftErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddRow = () => {
    setDraftRows((rows) => [...rows, createEmptyDraftRow(workDate, defaultCategoryId)]);
  };

  const handleSaveAll = async () => {
    const filledDrafts = draftRows.filter((row) => !isDraftRowEmpty(row));
    const hasSavedEntries = entries.length > 0;

    if (filledDrafts.length === 0 && !hasSavedEntries) {
      show('Fill at least one row before saving', 'warning');
      return;
    }

    const allErrors = {};
    const validated = [];

    for (const row of filledDrafts) {
      const parsed = timesheetInlineRowSchema.safeParse({
        ...row,
        workDate: row.workDate || workDate,
      });
      if (!parsed.success) {
        const fieldErrors = {};
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path) fieldErrors[path] = { message: issue.message };
        });
        allErrors[row._draftId] = fieldErrors;
      } else {
        validated.push(enrichWithCategory(apiEntryToDisplay(parsed.data), categories));
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setDraftErrors(allErrors);
      show('Please fix the highlighted fields', 'error');
      return;
    }

    setDraftErrors({});

    let nextEntries = entries;

    if (editingKey && validated.length > 0) {
      const [updated, ...extras] = validated;
      nextEntries = entries.map((e) =>
        entryKey(e) === editingKey
          ? { ...updated, id: e.id, _localId: e._localId }
          : e,
      );
      if (extras.length > 0) {
        nextEntries = [
          ...nextEntries,
          ...extras.map((row) => ({
            ...row,
            _localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          })),
        ];
      }
    } else if (validated.length > 0) {
      nextEntries = [
        ...entries,
        ...validated.map((row) => ({
          ...row,
          _localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        })),
      ];
    }

    if (sumHours(nextEntries) > maxHours) {
      show(`Total hours exceed the daily limit of ${maxHours}h`, 'error');
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        date: workDate,
        payload: { status: 'DRAFT', entries: serializeEntriesForApi(nextEntries) },
      });
      show(
        editingKey
          ? 'Entry updated'
          : validated.length > 1
            ? `${validated.length} records saved`
            : 'All records saved',
      );
      setEntries(nextEntries);
      setDraftRows([createEmptyDraftRow(workDate, defaultCategoryId)]);
      setEditingKey(null);
      refetch();
    } catch (e) {
      show(e?.message ?? 'Failed to save', 'error');
    }
  };

  const handleDelete = async (entry) => {
    if (!isEditable) return;
    const key = entryKey(entry);
    const next = entries.filter((e) => entryKey(e) !== key);
    setEntries(next);
    try {
      await upsertMutation.mutateAsync({
        date: workDate,
        payload: { status: 'DRAFT', entries: serializeEntriesForApi(next) },
      });
      show('Record removed');
      if (editingKey === key) {
        setEditingKey(null);
        setDraftRows([createEmptyDraftRow(workDate, defaultCategoryId)]);
      }
      refetch();
    } catch (e) {
      show(e?.message ?? 'Failed to delete', 'error');
      refetch();
    }
  };

  const handleReopen = async () => {
    try {
      await reopenMutation.mutateAsync(workDate);
      show('Timesheet reopened for editing');
      refetch();
    } catch (e) {
      show(e?.message ?? 'Could not reopen', 'error');
    }
  };

  const handleReportEdit = async (row) => {
    try {
      if (row.canReopen && row.dayStatus === 'SUBMITTED') {
        await reopenMutation.mutateAsync(row.workDate);
      }
      setShowMyReport(false);
      setSearchParams({ date: row.workDate });
      setPendingEditEntryId(row.entryId);
    } catch (e) {
      show(e?.message ?? 'Could not open entry for editing', 'error');
    }
  };

  const handleReportDelete = async (row) => {
    if (!row.canModify) {
      show('This entry cannot be deleted', 'warning');
      return;
    }
    try {
      if (row.canReopen && row.dayStatus === 'SUBMITTED') {
        await reopenMutation.mutateAsync(row.workDate);
      }
      const day = await fetchTimesheetDay(row.workDate);
      if (!day.editable) {
        show('This timesheet cannot be edited', 'error');
        return;
      }
      const next = (day.entries ?? []).filter((e) => e.id !== row.entryId);
      await upsertMutation.mutateAsync({
        date: row.workDate,
        payload: { status: 'DRAFT', entries: serializeEntriesForApi(next) },
      });
      show('Record removed');
      if (row.workDate === workDate) refetch();
    } catch (e) {
      show(e?.message ?? 'Failed to delete', 'error');
    }
  };

  if (showMyReport) {
    return (
      <Box>
        <TimesheetMyReportView
          initialDate={workDate}
          onBack={() => setShowMyReport(false)}
          onEdit={handleReportEdit}
          onDelete={handleReportDelete}
          showSnackbar={show}
        />
        <AppSnackbar snackbar={snackbar} onClose={close} />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Timesheet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.settings?.employeeHelperText ||
              'Use + to add rows, fill each line, then Save All to store them together.'}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignSelf: { sm: 'flex-start' } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AssessmentRoundedIcon />}
            onClick={() => setShowMyReport(true)}
          >
            My Report
          </Button>
        </Stack>
      </Box>

      {data?.rejectionReason ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Rejected: {data.rejectionReason}
        </Alert>
      ) : null}

      {canReopen ? (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleReopen}
              disabled={reopenMutation.isPending}
            >
              Edit timesheet
            </Button>
          }
        >
          Submitted for this day. Reopen to add or edit rows.
        </Alert>
      ) : null}

      {!isEditable && !canReopen && data?.status === 'APPROVED' ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Approved — this day is read-only.
        </Alert>
      ) : null}

      {overLimit ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Total {totalHours.toFixed(1)}h exceeds the daily limit of {maxHours}h.
        </Alert>
      ) : null}

      <PageCard sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
          >
            <TimesheetStatusChip status={data?.status} size="medium" />
            <Typography variant="body2" fontWeight={600}>
              {entries.length} record(s) · {totalHours.toFixed(1)}h / {maxHours}h max
            </Typography>
          </Stack>
        </CardContent>
      </PageCard>

      {isEditable ? (
        <PageCard sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {editingKey ? 'Edit entry' : 'New entries'}
            </Typography>
            <Stack spacing={2}>
              {draftRows.map((row, index) => (
                <Box key={row._draftId}>
                  {draftRows.length > 1 ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, display: 'block' }}
                    >
                      Row {index + 1}
                    </Typography>
                  ) : null}
                  <TimesheetInlineEntryRow
                    value={{ ...row, workDate: row.workDate || workDate }}
                    onChange={(next) => handleDraftChange(row._draftId, next)}
                    errors={draftErrors[row._draftId] ?? {}}
                    minDate={minDate}
                    maxDate={maxDate}
                    onAdd={handleAddRow}
                    onSaveAll={handleSaveAll}
                    addLabel="Add row"
                    saving={upsertMutation.isPending}
                    categories={categories}
                    showActions={false}
                    showDate={index === 0}
                  />
                </Box>
              ))}
              <TimesheetInlineEntryRow
                actionsOnly
                value={{ workDate }}
                onChange={() => {}}
                onAdd={handleAddRow}
                onSaveAll={handleSaveAll}
                addLabel="Add row"
                saving={upsertMutation.isPending}
                categories={categories}
              />
            </Stack>
          </CardContent>
        </PageCard>
      ) : null}

      <PageCard>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell>
                  <strong>#</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell>
                  <strong>Work Area/Description</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Hours</strong>
                </TableCell>
                <TableCell>
                  <strong>Task status</strong>
                </TableCell>
                <TableCell>
                  <strong>Priority</strong>
                </TableCell>
                <TableCell>
                  <strong>Ref #</strong>
                </TableCell>
                {isEditable ? (
                  <TableCell align="right">
                    <strong>Actions</strong>
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isEditable ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={isEditable ? 8 : 7}>
                    <Alert severity="error">{error.message}</Alert>
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEditable ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No records for this date. Use the form above to add your first entry.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry, index) => (
                  <TableRow
                    key={entryKey(entry)}
                    hover
                    sx={{
                      cursor: isEditable ? 'pointer' : 'default',
                      bgcolor: editingKey === entryKey(entry) ? 'action.hover' : undefined,
                    }}
                    onClick={() => isEditable && loadEntryIntoDrafts(entry)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.categoryName || '—'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.workAreaDescription}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {Number(entry.hoursSpent).toFixed(1)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labelFor(TASK_STATUSES, entry.taskStatus)}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labelFor(PRIORITIES, entry.priority)}
                        size="small"
                        color={
                          entry.priority === 'CRITICAL' || entry.priority === 'HIGH'
                            ? 'error'
                            : entry.priority === 'LOW'
                              ? 'default'
                              : 'warning'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {entry.refNumber || '—'}
                      </Typography>
                    </TableCell>
                    {isEditable ? (
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                          <IconButton
                            size="small"
                            aria-label="Edit"
                            onClick={() => loadEntryIntoDrafts(entry)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete"
                            onClick={() => handleDelete(entry)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </Box>
  );
}
