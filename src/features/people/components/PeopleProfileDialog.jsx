import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import { usePersonDetail } from '../hooks/usePeopleQueries';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Field({ label, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 0.5 }}
      >
        {label}
      </Typography>
      <Box sx={{ typography: 'body2', fontWeight: 600, color: 'text.primary' }}>
        {children ?? '—'}
      </Box>
    </Box>
  );
}

function statusLabel(status) {
  if (!status) return '—';
  if (status === 'PENDING_ACTIVATION') return 'Pending activation';
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
}

/**
 * @param {{
 *   open: boolean,
 *   employeeId: string | null | undefined,
 *   onClose: () => void,
 *   onOpenPerson: (employeeId: string) => void,
 * }} props
 */
export function PeopleProfileDialog({ open, employeeId, onClose, onOpenPerson }) {
  const detailQuery = usePersonDetail(employeeId, open && Boolean(employeeId));
  const person = detailQuery.data;
  const errorStatus = detailQuery.error?.status;

  const initials = (person?.name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  let body = null;

  if (detailQuery.isLoading) {
    body = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  } else if (detailQuery.error) {
    const message =
      errorStatus === 404 || errorStatus === 403
        ? 'You don’t have access to this profile, or it no longer exists.'
        : detailQuery.error.message || 'Failed to load profile. Please try again.';
    body = <Alert severity="error">{message}</Alert>;
  } else if (!person) {
    body = <Alert severity="warning">Profile not found.</Alert>;
  } else {
    body = (
      <>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, mb: 3, pr: 5 }}>
          <Avatar
            src={person.profilePhotoPreviewUrl || undefined}
            alt={person.name}
            sx={{ width: 64, height: 64, fontSize: 24 }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {person.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {person.designationName || 'No designation'}
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1} sx={{ mb: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <WorkOutlineRoundedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {person.designationName || '—'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <ApartmentRoundedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {person.departmentName || '—'}
                </Typography>
              </Stack>
            </Stack>

            <Field label="Email address">
              {person.email ? (
                <Link href={`mailto:${person.email}`} underline="hover" fontWeight={600}>
                  {person.email}
                </Link>
              ) : (
                '—'
              )}
            </Field>
            <Field label="Home address">{person.address || '—'}</Field>
            <Field label="Phone number">{person.phoneNumber || '—'}</Field>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Manager
            </Typography>
            {person.manager?.id ? (
              <Box sx={{ mb: 3 }}>
                <Link
                  component="button"
                  variant="body2"
                  underline="hover"
                  fontWeight={600}
                  onClick={() => onOpenPerson(person.manager.id)}
                  sx={{
                    cursor: 'pointer',
                    border: 0,
                    bgcolor: 'transparent',
                    p: 0,
                    textAlign: 'left',
                    display: 'block',
                  }}
                >
                  {person.manager.name}
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {person.manager.designationName || '—'}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No manager assigned
              </Typography>
            )}

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Employment
            </Typography>
            <Field label="Employee code">{person.employeeCode || '—'}</Field>
            <Field label="Date of joining">{formatDate(person.dateOfJoining)}</Field>
            <Field label="Status">{statusLabel(person.status)}</Field>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: 2,
          position: 'relative',
        },
      }}
    >
      <IconButton
        aria-label="Close profile"
        onClick={onClose}
        size="small"
        sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
      >
        <CloseRoundedIcon />
      </IconButton>
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>{body}</DialogContent>
    </Dialog>
  );
}
