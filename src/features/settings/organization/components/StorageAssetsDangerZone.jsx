import { useCallback, useEffect, useState } from 'react';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  fetchOrganizationAssetSummary,
  purgeAllOrganizationAssets,
  PURGE_ASSETS_CONFIRM_PHRASE,
} from '@/shared/api/storageApi';

/**
 * Danger zone: delete every S3 object under the current organization prefix.
 * @param {{ onPurged?: () => void, readOnly?: boolean }} props
 */
export function StorageAssetsDangerZone({ onPurged, readOnly = false }) {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [purging, setPurging] = useState(false);
  const [purgeError, setPurgeError] = useState('');
  const [purgeResult, setPurgeResult] = useState(null);

  const loadSummary = useCallback(async () => {
    if (readOnly) {
      setSummaryLoading(false);
      return;
    }
    try {
      setSummaryLoading(true);
      setSummaryError('');
      const data = await fetchOrganizationAssetSummary();
      setSummary(data);
    } catch (err) {
      setSummaryError(err?.message || 'Could not load storage summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, [readOnly]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleOpen = () => {
    setConfirmText('');
    setPurgeError('');
    setPurgeResult(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    if (purging) return;
    setDialogOpen(false);
  };

  const handlePurge = async () => {
    if (confirmText !== PURGE_ASSETS_CONFIRM_PHRASE) return;
    try {
      setPurging(true);
      setPurgeError('');
      const result = await purgeAllOrganizationAssets(PURGE_ASSETS_CONFIRM_PHRASE);
      setPurgeResult(result);
      setDialogOpen(false);
      await loadSummary();
      onPurged?.();
    } catch (err) {
      setPurgeError(err?.message || 'Failed to delete assets.');
    } finally {
      setPurging(false);
    }
  };

  if (readOnly) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 4,
        p: 3,
        borderColor: 'error.light',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(211, 47, 47, 0.04)',
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" color="error.main" fontWeight={700}>
            Cloud storage — delete all assets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Permanently removes every file in AWS S3 for this organization: employee documents, leave
            attachments, profile photos, logos, and staging uploads. Database records are kept but
            file links are cleared. This cannot be undone.
          </Typography>
        </Box>

        {summaryLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Counting stored objects…
            </Typography>
          </Box>
        ) : summaryError ? (
          <Alert severity="warning">{summaryError}</Alert>
        ) : (
          <Typography variant="body2">
            <strong>{summary?.objectCount ?? 0}</strong> object(s) in{' '}
            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
              {summary?.prefix || 'organizations/…/'}
            </Typography>
          </Typography>
        )}

        {purgeResult ? (
          <Alert severity="success">
            Deleted {purgeResult.s3ObjectsDeleted} S3 object(s). Cleared{' '}
            {purgeResult.documentReferencesCleared} document link(s),{' '}
            {purgeResult.profilePhotosCleared} profile photo(s).
            {purgeResult.organizationLogoCleared ? ' Organization logo removed.' : ''}
          </Alert>
        ) : null}

        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverRoundedIcon />}
            onClick={handleOpen}
            disabled={summaryLoading || Boolean(summaryError)}
          >
            Delete all cloud assets
          </Button>
        </Box>
      </Stack>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete all cloud assets?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="error" variant="outlined">
              This will delete <strong>{summary?.objectCount ?? 0}</strong> file(s) from AWS S3 for
              this organization. Legacy inline documents in the database are not affected.
            </Alert>
            <Typography variant="body2">
              Type <strong>{PURGE_ASSETS_CONFIRM_PHRASE}</strong> to confirm:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={PURGE_ASSETS_CONFIRM_PHRASE}
              autoComplete="off"
            />
            {purgeError ? <Alert severity="error">{purgeError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={purging}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={purging || confirmText !== PURGE_ASSETS_CONFIRM_PHRASE}
            onClick={handlePurge}
            startIcon={purging ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {purging ? 'Deleting…' : 'Delete everything'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
