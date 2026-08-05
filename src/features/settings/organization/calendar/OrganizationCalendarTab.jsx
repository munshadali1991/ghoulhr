import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TablePagination,
  TextField,
} from '@mui/material';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
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
import { HolidayImportDialog } from './components/HolidayImportDialog';
import { CalendarYearPreview } from './components/CalendarYearPreview';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];
const DEFAULT_ROWS_PER_PAGE = 20;
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

/**
 * @param {{
 *   organizationId: string,
 *   addHolidayNonce?: number,
 *   importHolidayNonce?: number,
 *   onMetaChange?: (meta: { status: string | null, holidayCount: number }) => void,
 *   canWrite?: boolean,
 * }} props
 */
export function OrganizationCalendarTab({
  organizationId,
  addHolidayNonce = 0,
  importHolidayNonce = 0,
  onMetaChange,
  canWrite = true,
}) {
  const [year, setYear] = useState(currentYear);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const { data, isLoading, error } = useOrganizationCalendar(organizationId, year);
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    publishMutation,
    bulkImportMutation,
  } = useOrganizationCalendarMutations(organizationId, year);

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

  const filteredHolidays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return holidays;
    return holidays.filter((h) => {
      const typeLabel = h.holidayType === 'RESTRICTED' ? 'restricted' : 'general';
      const location = (h.locationName || 'all locations').toLowerCase();
      return (
        h.name?.toLowerCase().includes(q) ||
        h.holidayDate?.toLowerCase().includes(q) ||
        typeLabel.includes(q) ||
        location.includes(q)
      );
    });
  }, [holidays, searchQuery]);

  const maxPage = Math.max(0, Math.ceil(filteredHolidays.length / rowsPerPage) - 1);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, year]);

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const paginatedHolidays = filteredHolidays.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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

  useEffect(() => {
    if (importHolidayNonce > 0 && canWrite) {
      setImportOpen(true);
    }
  }, [importHolidayNonce, canWrite]);

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

  const handleImportCommit = async (rows) => {
    const result = await bulkImportMutation.mutateAsync({
      year,
      holidays: rows.map((r) => ({
        holidayDate: r.holidayDate,
        name: r.name,
        holidayType: r.holidayType,
        locationId: r.locationId || null,
      })),
    });
    const created = result?.created ?? 0;
    const updated = result?.updated ?? 0;
    showStatus(
      `Imported ${created + updated} holidays (${created} created, ${updated} updated)`,
    );
    return result;
  };

  const emptyMessage = searchQuery.trim()
    ? 'No holidays match your search'
    : 'No holidays for this year. Add holidays or upload an Excel sheet to build your organization calendar.';

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
              {holidays.length > 0 ? (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, date, type, or location…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              ) : null}
              <CalendarHolidaysTable
                holidays={paginatedHolidays}
                emptyMessage={emptyMessage}
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
              {filteredHolidays.length > 0 ? (
                <TablePagination
                  component="div"
                  count={filteredHolidays.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  labelRowsPerPage="Rows per page"
                />
              ) : null}
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

      <HolidayImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        year={year}
        locations={locations}
        existingHolidays={holidays}
        calendarStatus={calendar?.status ?? null}
        onCommit={handleImportCommit}
        isCommitting={bulkImportMutation.isPending}
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
