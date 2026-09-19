import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { downloadStoredFile } from '@/shared/api/storageApi';
import {
  getManagerExpenseReceipt,
  getManagerExpenseReceiptPreview,
} from '../api/expenseApi';
import { isPreviewableMime } from '@/features/document-centre/constants';

/**
 * @param {{
 *   open: boolean,
 *   claimId: string | null,
 *   lineId: string | null,
 *   fileNameHint?: string,
 *   onClose: () => void,
 * }} props
 */
export function ExpenseReceiptPreviewDialog({
  open,
  claimId,
  lineId,
  fileNameHint,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !claimId || !lineId) {
      setPreview(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setPreview(null);

    getManagerExpenseReceiptPreview(claimId, lineId)
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load receipt');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, claimId, lineId]);

  const previewUrl = preview?.previewUrl
    ? preview.previewUrl
    : preview?.dataBase64
      ? `data:${preview.mimeType};base64,${preview.dataBase64}`
      : null;

  const canEmbed =
    preview &&
    previewUrl &&
    isPreviewableMime(preview.mimeType, preview.fileName);
  const isImage = (preview?.mimeType || '').toLowerCase().startsWith('image/');

  const handleDownload = async () => {
    if (!claimId || !lineId) return;
    try {
      setDownloading(true);
      const file = await getManagerExpenseReceipt(claimId, lineId);
      downloadStoredFile(file);
    } catch (err) {
      setError(err?.message || 'Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {preview?.fileName || fileNameHint || 'Receipt preview'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : canEmbed && isImage ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={previewUrl}
              alt={preview.fileName}
              sx={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
          </Box>
        ) : canEmbed ? (
          <Box
            component="iframe"
            title={preview.fileName}
            src={previewUrl}
            sx={{ width: '100%', height: '70vh', border: 0 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Preview is not available for this file type. Use Download instead.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownload} disabled={!claimId || !lineId || downloading}>
          Download
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
