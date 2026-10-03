import { useEffect, useState } from 'react';
import {
  Alert,
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
import { uploadForm, uploadPolicy } from '../api/documentCentreApi';
import { POLICY_SUBTABS } from '../constants';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSuccess: () => void,
 *   kind: 'policy' | 'form',
 *   defaultSubcategory?: string,
 * }} props
 */
export function PublicDocumentUploadDialog({
  open,
  onClose,
  onSuccess,
  kind,
  defaultSubcategory = 'GENERAL',
}) {
  const [title, setTitle] = useState('');
  const [subcategory, setSubcategory] = useState(defaultSubcategory);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setFile(null);
    setError('');
    setSubcategory(defaultSubcategory);
    setBusy(false);
  }, [open, defaultSubcategory]);

  const handleClose = () => {
    if (busy) return;
    setTitle('');
    setFile(null);
    setError('');
    onClose();
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!file) {
      setError('Select a file');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (kind === 'policy') {
        await uploadPolicy({ title: title.trim(), subcategory, file });
      } else {
        await uploadForm({ title: title.trim(), file });
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Upload {kind === 'policy' ? 'company policy' : 'form'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          {kind === 'policy' ? (
            <TextField
              select
              label="Category"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              fullWidth
            >
              {POLICY_SUBTABS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
          <Button variant="outlined" component="label">
            Choose file
            <input
              hidden
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>
          {file ? (
            <Typography variant="body2" color="text.secondary">
              {file.name}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={busy || !file || !title.trim()}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
