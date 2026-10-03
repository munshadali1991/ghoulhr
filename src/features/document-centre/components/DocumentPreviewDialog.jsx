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
import { previewDocument } from '../api/documentCentreApi';
import { isPreviewableMime } from '../constants';

/**
 * @param {{
 *   open: boolean,
 *   documentId: string | null,
 *   onClose: () => void,
 *   onDownload?: (id: string) => void,
 * }} props
 */
export function DocumentPreviewDialog({ open, documentId, onClose, onDownload }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!open || !documentId) {
      setPreview(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    previewDocument(documentId)
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load preview');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, documentId]);

  const canEmbed =
    preview && isPreviewableMime(preview.mimeType, preview.fileName);
  const isImage = (preview?.mimeType || '').toLowerCase().startsWith('image/');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{preview?.fileName || 'Preview'}</DialogTitle>
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
              src={preview.previewUrl}
              alt={preview.fileName}
              sx={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
          </Box>
        ) : canEmbed ? (
          <Box
            component="iframe"
            title={preview.fileName}
            src={preview.previewUrl}
            sx={{
              width: '100%',
              height: '70vh',
              border: 'none',
              borderRadius: 1,
            }}
          />
        ) : (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Preview is not available for this file type. Download the file to
            open it.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {documentId && onDownload ? (
          <Button onClick={() => onDownload(documentId)}>Download</Button>
        ) : null}
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
