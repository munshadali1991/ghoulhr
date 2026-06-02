import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { TimesheetFormShell } from '../../components/timesheet/TimesheetFormShell';
import { TimesheetEntryFormBody } from '../../components/timesheet/TimesheetEntryFormBody';
import { DEFAULT_ENTRY } from '../../constants/timesheetEnums';
import { timesheetEntrySchema } from '../../schemas/timesheetEntrySchema';
import {
  useTimesheetDay,
  useUpsertTimesheetDay,
} from '../../hooks/useEmployeePortalQueries';

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

export function TimesheetFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workDate = searchParams.get('date') || dayjs().format('YYYY-MM-DD');
  const entryId = searchParams.get('entryId');
  const isEdit = Boolean(entryId);

  const { data, isLoading, error } = useTimesheetDay(workDate);
  const upsertMutation = useUpsertTimesheetDay();
  const { snackbar, show, close } = useAppSnackbar();

  const existingEntry = data?.entries?.find(
    (e) => entryKey(e) === entryId || e.id === entryId,
  );

  const methods = useForm({
    resolver: zodResolver(timesheetEntrySchema),
    defaultValues: DEFAULT_ENTRY,
    mode: 'onTouched',
    values:
      isEdit && existingEntry
        ? {
            ...DEFAULT_ENTRY,
            ...existingEntry,
            blockerNotes: existingEntry.blockerNotes ?? '',
          }
        : DEFAULT_ENTRY,
  });

  const backToList = () => navigate(`/timesheet?date=${workDate}`);

  const persistEntry = async (values, { navigateBack }) => {
    if (!data?.editable && !data?.isMissing) {
      show('This timesheet cannot be edited', 'error');
      return;
    }

    const normalized = {
      ...values,
      hoursSpent: Number(values.hoursSpent),
      blockerNotes: values.blockerNotes?.trim() || undefined,
    };

    let nextEntries = [...(data?.entries ?? [])];

    if (isEdit && existingEntry) {
      const key = entryKey(existingEntry);
      nextEntries = nextEntries.map((e) =>
        entryKey(e) === key ? { ...normalized, id: e.id, _localId: e._localId } : e,
      );
    } else {
      nextEntries.push({ ...normalized, _localId: `local-${Date.now()}` });
    }

    try {
      const result = await upsertMutation.mutateAsync({
        date: workDate,
        payload: {
          status: 'DRAFT',
          entries: serializeEntriesForApi(nextEntries),
        },
      });

      if (navigateBack) {
        show(isEdit ? 'Timesheet updated' : 'Timesheet added');
        backToList();
        return;
      }

      show('Draft saved');
      if (!isEdit && result?.entries?.length) {
        const saved = result.entries[result.entries.length - 1];
        if (saved?.id) {
          navigate(`/timesheet/edit?date=${workDate}&entryId=${encodeURIComponent(saved.id)}`, {
            replace: true,
          });
        }
      }
    } catch (e) {
      show(e?.message ?? 'Failed to save timesheet', 'error');
    }
  };

  const onSubmit = methods.handleSubmit((values) => persistEntry(values, { navigateBack: true }));
  const onSaveDraft = methods.handleSubmit((values) => persistEntry(values, { navigateBack: false }));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (isEdit && !existingEntry) {
    return (
      <Alert severity="warning">
        Timesheet not found.{' '}
        <Button size="small" onClick={backToList} sx={{ ml: 1 }}>
          Back to list
        </Button>
      </Alert>
    );
  }

  const dateLabel = dayjs(workDate).format('dddd, D MMMM YYYY');

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <TimesheetFormShell
          title={isEdit ? 'Edit timesheet' : 'Add timesheet'}
          subtitle={dateLabel}
          onBack={backToList}
          onSaveDraft={onSaveDraft}
          saveDraftDisabled={!data?.editable && !data?.isMissing}
          saving={upsertMutation.isPending}
          primaryLabel={isEdit ? 'Save changes' : 'Save timesheet'}
        >
          <TimesheetEntryFormBody />
        </TimesheetFormShell>
      </Box>

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </FormProvider>
  );
}
