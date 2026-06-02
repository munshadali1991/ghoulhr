import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const HOLIDAY_TYPES = [
  { value: 'GENERAL', label: 'General (org-wide non-working day)' },
  { value: 'RESTRICTED', label: 'Restricted (optional leave day)' },
];

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSave: (values: object) => Promise<void>,
 *   year: number,
 *   locations: { id: string, name: string }[],
 *   initial?: object | null,
 * }} props
 */
export function HolidayEditDialog({
  open,
  onClose,
  onSave,
  year,
  locations,
  initial = null,
}) {
  const [name, setName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayType, setHolidayType] = useState('GENERAL');
  const [locationId, setLocationId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const locationOptions = [
    { id: '', label: 'All locations' },
    ...locations.map((l) => ({ id: l.id, label: l.name })),
  ];

  const selectedLocation =
    locationOptions.find((o) => o.id === (locationId || '')) ?? locationOptions[0];

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initial) {
      setName(initial.name ?? '');
      setHolidayDate(initial.holidayDate ?? '');
      setHolidayType(initial.holidayType ?? 'GENERAL');
      setLocationId(initial.locationId ?? '');
    } else {
      setName('');
      setHolidayDate(`${year}-01-01`);
      setHolidayType('GENERAL');
      setLocationId('');
    }
  }, [open, initial, year]);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Holiday name is required');
      return;
    }
    if (!holidayDate) {
      setError('Date is required');
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        holidayDate,
        holidayType,
        locationId: locationId || undefined,
        year,
      });
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to save holiday');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Edit holiday' : 'Add holiday'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            label="Holiday name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: `${year}-01-01`, max: `${year}-12-31` }}
            required
            fullWidth
          />
          <TextField
            select
            label="Type"
            value={holidayType}
            onChange={(e) => setHolidayType(e.target.value)}
            fullWidth
          >
            {HOLIDAY_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            value={selectedLocation}
            onChange={(_, v) => setLocationId(v?.id ?? '')}
            options={locationOptions}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Location scope" />
            )}
          />
          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
