import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';

export const SIGN_IN_LOCATION_OPTIONS = [
  { value: 'WORK_FROM_OFFICE', label: 'Work From Office' },
  { value: 'WORK_FROM_HOME', label: 'Work from Home' },
  { value: 'CLIENT_LOCATION', label: 'Client Location' },
];

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: (signInLocation: string) => void | Promise<void>,
 *   isPending?: boolean,
 * }} props
 */
export function SignInLocationDialog({
  open,
  onClose,
  onConfirm,
  isPending = false,
}) {
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (open) setLocation('');
  }, [open]);

  const canSubmit = Boolean(location) && !isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onConfirm(location);
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2, overflow: 'hidden' },
      }}
    >
      <IconButton
        aria-label="Close"
        onClick={onClose}
        disabled={isPending}
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
      >
        <CloseRoundedIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ m: 0, mb: 0.5 }}>
              You are not signed in yet.
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ m: 0, mb: 2.5 }}>
              Tell us your work location.
            </Typography>

            <FormControl fullWidth required size="small">
              <InputLabel id="sign-in-location-label" shrink>
                Enter Sign-In Location
              </InputLabel>
              <Select
                labelId="sign-in-location-label"
                label="Enter Sign-In Location"
                value={location}
                displayEmpty
                notched
                onChange={(e) => setLocation(e.target.value)}
                disabled={isPending}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography component="span" color="text.secondary">
                        Select
                      </Typography>
                    );
                  }
                  const opt = SIGN_IN_LOCATION_OPTIONS.find((o) => o.value === selected);
                  return opt?.label ?? selected;
                }}
              >
                {SIGN_IN_LOCATION_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                disableElevation
                disabled={!canSubmit}
                onClick={handleSubmit}
                sx={{ fontWeight: 600, px: 2.5 }}
              >
                Sign In
              </Button>
            </Box>
          </Box>

          <Box
            aria-hidden
            sx={{
              display: { xs: 'none', sm: 'flex' },
              width: 140,
              height: 140,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              color: 'primary.main',
            }}
          >
            <ApartmentRoundedIcon sx={{ fontSize: 88, color: 'action.disabled', opacity: 0.45 }} />
            <LocationOnRoundedIcon
              sx={{
                fontSize: 42,
                color: 'primary.main',
                position: 'absolute',
                top: 18,
                right: 18,
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
