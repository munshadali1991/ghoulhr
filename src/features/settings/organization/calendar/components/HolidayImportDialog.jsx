import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
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
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { downloadHolidayExcelTemplate } from '../utils/holidayExcelTemplate';
import {
  annotateOverwriteFlags,
  parseHolidayExcelFile,
  resolveLocationName,
  validateHolidayImportRow,
} from '../utils/parseHolidayExcel';

const STEPS = {
  FORMAT: 'format',
  PREVIEW: 'preview',
  RESULT: 'result',
};

const HOLIDAY_TYPES = [
  { value: 'GENERAL', label: 'GENERAL' },
  { value: 'RESTRICTED', label: 'RESTRICTED' },
];

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   year: number,
 *   locations: { id: string, name: string }[],
 *   existingHolidays: object[],
 *   calendarStatus?: string | null,
 *   onCommit: (rows: object[]) => Promise<object>,
 *   isCommitting?: boolean,
 * }} props
 */
export function HolidayImportDialog({
  open,
  onClose,
  year,
  locations,
  existingHolidays,
  calendarStatus = null,
  onCommit,
  isCommitting = false,
}) {
  const [step, setStep] = useState(STEPS.FORMAT);
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [collapsedDuplicates, setCollapsedDuplicates] = useState(0);
  const [commitError, setCommitError] = useState('');
  const [result, setResult] = useState(null);
  const [parsing, setParsing] = useState(false);

  const locationOptions = useMemo(
    () => [
      { id: '', label: 'All locations' },
      ...locations.map((l) => ({ id: l.id, label: l.name })),
    ],
    [locations],
  );

  useEffect(() => {
    if (!open) return;
    setStep(STEPS.FORMAT);
    setRows([]);
    setParseError('');
    setCollapsedDuplicates(0);
    setCommitError('');
    setResult(null);
    setParsing(false);
  }, [open]);

  const annotatedRows = useMemo(
    () => annotateOverwriteFlags(rows, existingHolidays),
    [rows, existingHolidays],
  );

  const validRows = annotatedRows.filter((r) => r.errors.length === 0);
  const invalidCount = annotatedRows.length - validRows.length;
  const overwriteCount = validRows.filter((r) => r.willOverwrite).length;
  const createCount = validRows.length - overwriteCount;

  const updateRow = (key, patch) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        const next = { ...row, ...patch };
        if (patch.locationId !== undefined || patch.locationName !== undefined) {
          const locId = patch.locationId !== undefined ? patch.locationId : row.locationId;
          const loc = locationOptions.find((o) => o.id === (locId || ''));
          next.locationId = locId || null;
          next.locationName = locId ? loc?.label ?? null : null;
        }
        next.errors = validateHolidayImportRow(next, year, locations);
        return next;
      }),
    );
  };

  const removeRow = (key) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setParsing(true);
    setParseError('');
    try {
      const parsed = await parseHolidayExcelFile(file, { year, locations });
      if (!parsed.ok) {
        setParseError(parsed.error || 'Failed to parse Excel file');
        return;
      }
      setCollapsedDuplicates(parsed.collapsedDuplicates);
      setRows(parsed.rows);
      setStep(STEPS.PREVIEW);
    } finally {
      setParsing(false);
    }
  };

  const handleCommit = async () => {
    setCommitError('');
    if (validRows.length === 0) {
      setCommitError('Fix row errors before importing');
      return;
    }
    try {
      const response = await onCommit(validRows);
      setResult(response);
      setStep(STEPS.RESULT);
    } catch (e) {
      setCommitError(e.message || 'Failed to import holidays');
    }
  };

  const handleClose = () => {
    if (isCommitting) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload holiday Excel</DialogTitle>
      <DialogContent dividers>
        {step === STEPS.FORMAT ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Download the template, fill in holidays for {year}, then upload the file. You can
              preview and edit rows before importing.
            </Typography>

            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>
                      <strong>Column</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Required</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Notes</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Yes</TableCell>
                    <TableCell>YYYY-MM-DD within {year}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Yes</TableCell>
                    <TableCell>Holiday name (max 191 characters)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Yes</TableCell>
                    <TableCell>GENERAL or RESTRICTED</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>No</TableCell>
                    <TableCell>Blank / All = org-wide; otherwise exact location name</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => downloadHolidayExcelTemplate(year)}
              >
                Download template
              </Button>
              <CrudButton
                intent="create"
                component="label"
                startIcon={<UploadFileRoundedIcon />}
                disabled={parsing}
              >
                {parsing ? 'Reading…' : 'Select Excel file'}
                <input
                  hidden
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFile}
                />
              </CrudButton>
            </Stack>

            {parseError ? <Alert severity="error">{parseError}</Alert> : null}
          </Stack>
        ) : null}

        {step === STEPS.PREVIEW ? (
          <Stack spacing={2}>
            {calendarStatus === 'PUBLISHED' ? (
              <Alert severity="warning">
                Calendar is published — changes are visible to employees after import.
              </Alert>
            ) : null}

            <Alert severity="info">
              {validRows.length} holidays ready · {createCount} new · {overwriteCount} will
              overwrite existing entries
              {invalidCount > 0 ? ` · ${invalidCount} with errors` : ''}
              {collapsedDuplicates > 0
                ? ` · ${collapsedDuplicates} duplicate row(s) collapsed (last wins)`
                : ''}
            </Alert>

            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {annotatedRows.map((row) => {
                    const selectedLocation =
                      locationOptions.find((o) => o.id === (row.locationId || '')) ??
                      locationOptions[0];
                    return (
                      <TableRow key={row.key}>
                        <TableCell sx={{ minWidth: 140 }}>
                          <TextField
                            size="small"
                            type="date"
                            value={row.holidayDate || ''}
                            onChange={(e) => updateRow(row.key, { holidayDate: e.target.value })}
                            inputProps={{ min: `${year}-01-01`, max: `${year}-12-31` }}
                            error={row.errors.some((e) => e.toLowerCase().includes('date'))}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <TextField
                            size="small"
                            value={row.name}
                            onChange={(e) => updateRow(row.key, { name: e.target.value })}
                            error={row.errors.some((e) => e.toLowerCase().includes('name'))}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 130 }}>
                          <TextField
                            select
                            size="small"
                            value={row.holidayType || 'GENERAL'}
                            onChange={(e) => updateRow(row.key, { holidayType: e.target.value })}
                            fullWidth
                          >
                            {HOLIDAY_TYPES.map((t) => (
                              <MenuItem key={t.value} value={t.value}>
                                {t.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Autocomplete
                            size="small"
                            value={selectedLocation}
                            onChange={(_, v) => {
                              const id = v?.id ?? '';
                              const resolved = resolveLocationName(
                                id ? v.label : '',
                                locations,
                              );
                              updateRow(row.key, {
                                locationId: resolved.locationId,
                                locationName: resolved.locationName,
                              });
                            }}
                            options={locationOptions}
                            getOptionLabel={(o) => o.label}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <Stack spacing={0.5}>
                            {row.errors.length === 0 && row.willOverwrite ? (
                              <Chip size="small" color="warning" label="Will overwrite" />
                            ) : null}
                            {row.errors.length === 0 && !row.willOverwrite ? (
                              <Chip size="small" color="success" variant="outlined" label="New" />
                            ) : null}
                            {row.errors.map((err) => (
                              <Typography key={err} variant="caption" color="error" display="block">
                                {err}
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label="Remove row"
                            onClick={() => removeRow(row.key)}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {commitError ? <Alert severity="error">{commitError}</Alert> : null}
          </Stack>
        ) : null}

        {step === STEPS.RESULT ? (
          <Stack spacing={2}>
            <Alert severity="success">
              {result?.message ||
                `Imported ${(result?.created ?? 0) + (result?.updated ?? 0)} holidays (${result?.created ?? 0} created, ${result?.updated ?? 0} updated)`}
            </Alert>
            {result?.overwrites?.length ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Overwritten entries
                </Typography>
                <Stack spacing={0.5}>
                  {result.overwrites.slice(0, 20).map((o) => (
                    <Typography key={`${o.holidayDate}-${o.name}`} variant="body2" color="text.secondary">
                      {o.holidayDate}: “{o.previousName}” → “{o.name}”
                    </Typography>
                  ))}
                  {result.overwrites.length > 20 ? (
                    <Typography variant="caption" color="text.secondary">
                      +{result.overwrites.length - 20} more
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === STEPS.FORMAT ? (
          <Button onClick={handleClose}>Cancel</Button>
        ) : null}
        {step === STEPS.PREVIEW ? (
          <>
            <Button onClick={() => setStep(STEPS.FORMAT)} disabled={isCommitting}>
              Back
            </Button>
            <CrudButton
              intent="create"
              onClick={handleCommit}
              disabled={isCommitting || validRows.length === 0}
            >
              {isCommitting
                ? 'Importing…'
                : `Import ${validRows.length} holiday${validRows.length === 1 ? '' : 's'}`}
            </CrudButton>
          </>
        ) : null}
        {step === STEPS.RESULT ? (
          <CrudButton intent="save" onClick={handleClose}>
            Done
          </CrudButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
