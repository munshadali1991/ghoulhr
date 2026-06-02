import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { TimesheetDatePickerBar } from '../../components/timesheet/TimesheetDatePickerBar';
import { TimesheetDayActions } from '../../components/timesheet/TimesheetDayActions';
import { TimesheetStatusChip } from '../../components/timesheet/TimesheetStatusChip';
import { PRIORITIES, TASK_STATUSES, WORK_TYPES } from '../../constants/timesheetEnums';
import {
  useReopenTimesheetDay,
  useTimesheetDay,
  useUpsertTimesheetDay,
} from '../../hooks/useEmployeePortalQueries';

function sumHours(entries) {
  return entries.reduce((acc, e) => acc + Number(e.hoursSpent || 0), 0);
}

function serializeEntriesForApi(entries) {
  return entries.map((entry) => {
    const payload = {
      projectName: entry.projectName,
      taskName: entry.taskName,
      taskDescription: entry.taskDescription,
      workType: entry.workType,
      hoursSpent: Number(entry.hoursSpent),
      taskStatus: entry.taskStatus,
      priority: entry.priority,
    };
    if (entry.id) payload.id = entry.id;
    if (entry.blockerNotes) payload.blockerNotes = entry.blockerNotes;
    return payload;
  });
}

function entryKey(entry) {
  return entry.id ?? entry._localId;
}

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function priorityColor(priority) {
  switch (priority) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    default:
      return 'default';
  }
}

export function TimesheetDayPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const dateParam = searchParams.get('date');
  const selectedDate = useMemo(
    () => (dateParam ? dayjs(dateParam) : dayjs()),
    [dateParam],
  );
  const workDate = selectedDate.format('YYYY-MM-DD');

  const { data, isLoading, error, refetch } = useTimesheetDay(workDate);
  const upsertMutation = useUpsertTimesheetDay();
  const reopenMutation = useReopenTimesheetDay();
  const { snackbar, show, close } = useAppSnackbar();

  const [entries, setEntries] = useState([]);

  const maxHours = data?.settings?.maxHoursPerDay ?? 12;
  const maxPastDays = data?.settings?.maxPastDays ?? 7;
  const minDate = dayjs().subtract(maxPastDays, 'day');
  const maxDate = dayjs();
  const isEditable = Boolean(data?.editable);
  const canReopen = Boolean(data?.canReopen);
  const totalHours = sumHours(entries);
  const overLimit = totalHours > maxHours;
  const canSubmit = entries.length > 0 && !overLimit;

  useEffect(() => {
    if (data) {
      setEntries(
        (data.entries ?? []).map((e, i) => ({
          ...e,
          _localId: e.id ?? `row-${i}`,
        })),
      );
    }
  }, [data]);

  const setDate = useCallback(
    (d) => {
      setSearchParams({ date: d.format('YYYY-MM-DD') });
    },
    [setSearchParams],
  );

  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.projectName?.toLowerCase().includes(q) ||
      entry.taskName?.toLowerCase().includes(q) ||
      entry.taskDescription?.toLowerCase().includes(q) ||
      labelFor(WORK_TYPES, entry.workType).toLowerCase().includes(q)
    );
  });

  const handleSave = async (status) => {
    try {
      await upsertMutation.mutateAsync({
        date: workDate,
        payload: {
          status,
          entries: serializeEntriesForApi(entries),
        },
      });
      show(status === 'SUBMITTED' ? 'All timesheets submitted' : 'Draft saved');
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
      show('Timesheet removed');
      refetch();
    } catch (e) {
      show(e?.message ?? 'Failed to delete', 'error');
      refetch();
    }
  };

  const handleReopen = async () => {
    try {
      await reopenMutation.mutateAsync(workDate);
      show('Timesheets reopened for editing');
      refetch();
    } catch (e) {
      show(e?.message ?? 'Could not reopen', 'error');
    }
  };

  const goAdd = () => navigate(`/timesheet/add?date=${workDate}`);
  const goEdit = (entry) =>
    navigate(`/timesheet/edit?date=${workDate}&entryId=${encodeURIComponent(entryKey(entry))}`);

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
              'Add separate timesheets for each task. Submit when your day is complete.'}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {isEditable ? (
            <BrandedButton startIcon={<PostAddRoundedIcon />} onClick={goAdd}>
              Add Timesheet
            </BrandedButton>
          ) : null}
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
            <Button color="inherit" size="small" onClick={handleReopen} disabled={reopenMutation.isPending}>
              Edit timesheets
            </Button>
          }
        >
          Submitted for this day. Reopen to edit individual timesheets.
        </Alert>
      ) : null}

      {!isEditable && !canReopen && data?.status === 'APPROVED' ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Approved — timesheets for this day cannot be edited.
        </Alert>
      ) : null}

      {overLimit ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Total {totalHours.toFixed(1)}h exceeds the daily limit of {maxHours}h. Fix hours before
          submitting.
        </Alert>
      ) : null}

      <PageCard sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={2}
          >
            <TimesheetDatePickerBar
              value={selectedDate}
              onChange={setDate}
              minDate={minDate}
              maxDate={maxDate}
            />
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <TimesheetStatusChip status={data?.status} size="medium" />
              <Typography variant="body2" fontWeight={600}>
                Total: {totalHours.toFixed(1)}h / {maxHours}h
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </PageCard>

      <PageCard sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by project, task, or work type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </PageCard>

      <PageCard sx={{ mb: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell>
                  <strong>#</strong>
                </TableCell>
                <TableCell>
                  <strong>Project</strong>
                </TableCell>
                <TableCell>
                  <strong>Task</strong>
                </TableCell>
                <TableCell>
                  <strong>Work type</strong>
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
                <TableCell align="right">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading timesheets...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Alert severity="error">{error.message}</Alert>
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {searchQuery
                        ? 'No timesheets match your search'
                        : 'No timesheets for this day yet'}
                    </Typography>
                    {isEditable && !searchQuery ? (
                      <Button
                        variant="outlined"
                        startIcon={<AddRoundedIcon />}
                        onClick={goAdd}
                        sx={{ mt: 2 }}
                      >
                        Add your first timesheet
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry, index) => (
                  <TableRow
                    key={entryKey(entry)}
                    hover
                    sx={{ cursor: isEditable ? 'pointer' : 'default' }}
                    onClick={() => isEditable && goEdit(entry)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {entry.projectName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {entry.taskName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.taskDescription}
                      </Typography>
                    </TableCell>
                    <TableCell>{labelFor(WORK_TYPES, entry.workType)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{Number(entry.hoursSpent).toFixed(1)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labelFor(TASK_STATUSES, entry.taskStatus)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labelFor(PRIORITIES, entry.priority)}
                        size="small"
                        color={priorityColor(entry.priority)}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {isEditable ? (
                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                          <IconButton
                            size="small"
                            aria-label="Edit timesheet"
                            onClick={() => goEdit(entry)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete timesheet"
                            onClick={() => handleDelete(entry)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>

      <TimesheetDayActions
        editable={isEditable}
        isSaving={upsertMutation.isPending}
        canSubmit={canSubmit}
        onSaveDraft={() => handleSave('DRAFT')}
        onSubmit={() => handleSave('SUBMITTED')}
      />

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </Box>
  );
}
