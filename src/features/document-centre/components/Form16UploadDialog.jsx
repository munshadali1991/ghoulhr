import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { uploadForm16 } from '../api/documentCentreApi';

/**
 * @param {{ open: boolean, onClose: () => void, onSuccess: () => void }} props
 */
export function Form16UploadDialog({ open, onClose, onSuccess }) {
  const [financialYear, setFinancialYear] = useState('2025-26');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleClose = () => {
    if (busy) return;
    setFile(null);
    setError('');
    setResult(null);
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Select a PDF or ZIP file');
      return;
    }
    if (!financialYear.trim()) {
      setError('Financial year is required');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await uploadForm16({
        file,
        financialYear: financialYear.trim(),
      });
      setResult(res);
      if (res.errorCount === 0) {
        onSuccess();
        handleClose();
      }
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Form 16</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {result?.errorCount > 0 ? (
            <Alert severity="warning">
              Uploaded {result.successCount}, failed {result.errorCount}.{' '}
              {(result.errors || [])
                .slice(0, 3)
                .map((e) => `${e.fileName}: ${e.message}`)
                .join(' · ')}
            </Alert>
          ) : null}
          <TextField
            label="Financial year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            placeholder="2025-26"
            fullWidth
            helperText="Name PDF files as EMP-CODE.pdf or EMP-CODE_FY.pdf. ZIP supported."
          />
          <Button variant="outlined" component="label">
            Choose PDF or ZIP
            <input
              hidden
              type="file"
              accept=".pdf,.zip,application/pdf,application/zip"
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
        <Button variant="contained" onClick={handleUpload} disabled={busy || !file}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
