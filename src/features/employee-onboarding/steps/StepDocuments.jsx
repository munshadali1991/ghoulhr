import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { DOCUMENT_TYPE_OPTIONS, documentTypeLabel } from '../constants';

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx';

export function StepDocuments() {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'documents' });
  const [uploadError, setUploadError] = useState('');
  const [progress, setProgress] = useState(0);
  const [docType, setDocType] = useState('OFFER_LETTER');
  const [lastBatchHint, setLastBatchHint] = useState('');

  const readFile = useCallback(
    (file, type) =>
      new Promise((resolve, reject) => {
        if (file.size > MAX_BYTES) {
          reject(new Error(`File exceeds ${MAX_BYTES / 1024 / 1024} MB`));
          return;
        }
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        reader.onload = () => {
          setProgress(100);
          const result = String(reader.result || '');
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            documentType: type,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            dataBase64: base64,
          });
        };
        reader.onerror = () => reject(new Error('Read failed'));
        reader.readAsDataURL(file);
      }),
    [],
  );

  const onFiles = async (fileList) => {
    setUploadError('');
    setProgress(0);
    /** Snapshot at start so changing the dropdown mid-read does not retag later files. */
    const categoryForBatch = docType;
    const files = Array.from(fileList || []);
    let added = 0;
    for (const file of files) {
      try {
        const row = await readFile(file, categoryForBatch);
        append(row);
        added += 1;
      } catch (e) {
        setUploadError(e.message || 'Upload error');
      }
    }
    if (added > 0) {
      setLastBatchHint(
        added === 1
          ? `Added 1 file as “${documentTypeLabel(categoryForBatch)}”. Change the row below if that was wrong.`
          : `Added ${added} files as “${documentTypeLabel(categoryForBatch)}”. Each row has its own category selector.`,
      );
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFiles(e.dataTransfer.files);
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 7
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Initial documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose the document type first, then add files. Each uploaded row stores its own category; you can fix mistakes
          with the dropdown on that row.
        </Typography>
      </Box>

      <Alert severity="info">
        Allowed: PDF, images, Word. Max {MAX_BYTES / 1024 / 1024} MB per file. Verification defaults to Pending on the
        server. Large submissions may be slow until uploads move to object storage.
      </Alert>

      {uploadError && <Alert severity="error">{uploadError}</Alert>}
      {lastBatchHint && <Alert severity="success">{lastBatchHint}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <TextField
          select
          size="small"
          label="Category for next upload"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          {DOCUMENT_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 360 }}>
          Next files you drop or browse are tagged as <strong>{documentTypeLabel(docType)}</strong> until you change this
          selector.
        </Typography>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderStyle: 'dashed',
          textAlign: 'center',
          bgcolor: 'action.hover',
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <input
          id="hr-doc-file"
          type="file"
          multiple
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <UploadFileRoundedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body2" gutterBottom>
          Drop files here, or add with the current category:{' '}
          <Button component="label" htmlFor="hr-doc-file-one" size="small" sx={{ mx: 0.5 }}>
            one file
          </Button>
          ·{' '}
          <Button component="label" htmlFor="hr-doc-file" size="small">
            several files
          </Button>
        </Typography>
        <input
          id="hr-doc-file-one"
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = '';
          }}
        />
        {progress > 0 && progress < 100 && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}
      </Paper>

      {fields.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No documents attached yet.
        </Typography>
      ) : (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ px: 0.5 }} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 200 }}>
              Category (stored on row)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
              File
            </Typography>
          </Stack>
          {fields.map((f, index) => {
            const rowType = watch(`documents.${index}.documentType`);
            return (
              <Paper
                key={f.id}
                variant="outlined"
                sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 200 }}>
                  <Chip size="small" color="primary" variant="outlined" label={documentTypeLabel(rowType)} />
                  <Controller
                    name={`documents.${index}.documentType`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select size="small" label="Change" sx={{ minWidth: 140 }}>
                        {DOCUMENT_TYPE_OPTIONS.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>
                <Box sx={{ flex: 1, minWidth: 160 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {watch(`documents.${index}.fileName`)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tagged as {documentTypeLabel(rowType)} · {(watch(`documents.${index}.sizeBytes`) / 1024).toFixed(1)}{' '}
                    KB · Pending verification
                  </Typography>
                </Box>
                <IconButton edge="end" onClick={() => remove(index)} aria-label="Remove">
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
