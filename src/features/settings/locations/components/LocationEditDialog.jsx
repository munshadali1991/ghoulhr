import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { Controller } from 'react-hook-form';
import { SectionLabel } from './SectionLabel';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editingIndex: number | null,
 *   isAddIntent: boolean,
 *   register: import('react-hook-form').UseFormRegister<{ locations: unknown[] }>,
 *   control: import('react-hook-form').Control<{ locations: unknown[] }>,
 *   errors: import('react-hook-form').FieldErrors<{ locations: unknown[] }>,
 *   remove: (index: number) => void,
 * }} props
 */
export function LocationEditDialog({
  open,
  onClose,
  editingIndex,
  isAddIntent,
  register,
  control,
  errors,
  remove,
}) {
  if (editingIndex == null) return null;

  const handleCancel = () => {
    if (isAddIntent) {
      remove(editingIndex);
    }
    onClose();
  };

  const field = (name) => `locations.${editingIndex}.${name}`;

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>{isAddIntent ? 'Add location' : 'Edit location'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <SectionLabel>Location details</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                required
                autoFocus
                label="Location name"
                placeholder="e.g. Headquarters — London"
                {...register(field('name'), { required: true })}
                error={!!errors.locations?.[editingIndex]?.name}
                helperText={errors.locations?.[editingIndex]?.name?.message}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Location code"
                placeholder="Optional short code (e.g. LON-01)"
                {...register(field('code'))}
                helperText="Optional identifier for exports and integrations."
              />
            </Grid>
          </Grid>

          <SectionLabel>Address</SectionLabel>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
            Capture order: country, state, city, postal code, then street. Coordinates last.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth label="Country" {...register(field('country'))} />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="State / province / region"
                {...register(field('region'))}
              />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="City" {...register(field('city'))} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Postal code" {...register(field('postalCode'))} />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Street address"
                placeholder="Building, street, unit"
                multiline
                minRows={2}
                {...register(field('addressLine1'))}
              />
            </Grid>
          </Grid>

          <SectionLabel>Geocoordinates</SectionLabel>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <MapOutlinedIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Optional — latitude and longitude for mapping or geo features.
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                inputProps={{ step: 'any' }}
                {...register(field('latitude'))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                inputProps={{ step: 'any' }}
                {...register(field('longitude'))}
              />
            </Grid>
          </Grid>

          <Controller
            name={field('isActive')}
            control={control}
            render={({ field: f }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!f.value}
                    onChange={(e) => f.onChange(e.target.checked)}
                    size="small"
                  />
                }
                label={f.value ? 'Active' : 'Inactive'}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
