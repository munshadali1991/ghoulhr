import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { useQuery } from '@tanstack/react-query';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ConfirmDeleteDialog } from '@/features/settings/shared/ConfirmDeleteDialog';
import { getLocations } from '@/features/settings/api/settingsApi';
import {
  useOrganizationCalendar,
  useOrganizationCalendarMutations,
} from './hooks/useOrganizationCalendar';
import { CalendarHolidaysTable } from './components/CalendarHolidaysTable';
import { HolidayEditDialog } from './components/HolidayEditDialog';
import { CalendarYearPreview } from './components/CalendarYearPreview';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

/**
 * @param {{
 *   organizationId: string,
 *   addHolidayNonce?: number,
 *   onMetaChange?: (meta: { status: string | null, holidayCount: number }) => void,
 *   canWrite?: boolean,
 * }} props
 */
export function OrganizationCalendarTab({
  organizationId,
  addHolidayNonce = 0,
  onMetaChange,
  canWrite = true,
}) {
  const [year, setYear] = useState(currentYear);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useOrganizationCalendar(organizationId, year);
  const { createMutation, updateMutation, deleteMutation, publishMutation } =
    useOrganizationCalendarMutations(organizationId, year);

  const locationsQuery = useQuery({
    queryKey: ['settings-locations', organizationId],
    queryFn: () => getLocations(organizationId),
    enabled: Boolean(organizationId),
  });

  const locations = useMemo(() => {
    const rows = locationsQuery.data?.locations ?? locationsQuery.data ?? [];
    return Array.isArray(rows)
      ? rows.filter((l) => l.isActive !== false).map((l) => ({ id: l.id, name: l.name }))
      : [];
  }, [locationsQuery.data]);

  const holidays = data?.holidays ?? [];
  const calendar = data?.calendar;
  const isDraft = calendar?.status === 'DRAFT';

  useEffect(() => {
    onMetaChange?.({
      status: calendar?.status ?? null,
      holidayCount: holidays.length,
    });
  }, [calendar?.status, holidays.length, onMetaChange]);

  useEffect(() => {
    if (addHolidayNonce > 0 && canWrite) {
      setEditRow(null);
      setDialogOpen(true);
    }
  }, [addHolidayNonce, canWrite]);

  const showStatus = (msg) => {
    setStatusMessage(msg);
  };

  const handleSave = async (values) => {
    setFormError('');
    if (editRow) {
      await updateMutation.mutateAsync({
        id: editRow.id,
        body: {
          name: values.name,
          holidayDate: values.holidayDate,
          holidayType: values.holidayType,
          locationId: values.locationId || null,
        },
      });
      showStatus('Holiday updated');
    } else {
      await createMutation.mutateAsync(values);
      showStatus('Holiday added');
    }
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    try {
      await deleteMutation.mutateAsync(deleteRow.id);
      setDeleteRow(null);
      showStatus('Holiday removed');
    } catch (e) {
      setFormError(e.message || 'Failed to delete holiday');
    }
  };

  const handlePublish = async () => {
    setFormError('');
    try {
      await publishMutation.mutateAsync();
      showStatus('Calendar published — employees can now see these holidays');
    } catch (e) {
      setFormError(e.message || 'Failed to publish calendar');
    }
  };

  return (
    <Box>
      <FormStatusAlerts
        loadError={error}
        loadErrorMessage="Failed to load organization calendar."
        formError={formError}
        onDismissFormError={() => setFormError('')}
        successMessage={statusMessage}
      />

      {isDraft ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          This calendar is in draft. Employees will not see these holidays until you publish the
          calendar.
        </Alert>
      ) : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {isDraft && canWrite ? (
          <Button
            variant="outlined"
            startIcon={<PublishRoundedIcon />}
            onClick={handlePublish}
            disabled={publishMutation.isPending || holidays.length === 0}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
          >
            Publish calendar
          </Button>
        ) : null}
      </Stack>

      <SettingsSection
        icon={<EventRoundedIcon color="primary" />}
        title={`Holidays (${year})`}
        description="General holidays are non-working days. Restricted holidays can be taken as optional leave."
      >
        <PageCard>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <CalendarHolidaysTable
                holidays={holidays}
                onEdit={
                  canWrite
                    ? (row) => {
                        setEditRow(row);
                        setDialogOpen(true);
                      }
                    : undefined
                }
                onDelete={canWrite ? setDeleteRow : undefined}
              />
            </Box>
          )}
        </PageCard>
      </SettingsSection>

      {!isLoading && holidays.length > 0 ? (
        <CalendarYearPreview year={year} holidays={holidays} />
      ) : null}

      <HolidayEditDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditRow(null);
        }}
        onSave={handleSave}
        year={year}
        locations={locations}
        initial={editRow}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteRow)}
        title="Delete holiday"
        description={
          deleteRow
            ? `Remove "${deleteRow.name}" on ${deleteRow.holidayDate} from the calendar?`
            : ''
        }
        onClose={() => setDeleteRow(null)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
