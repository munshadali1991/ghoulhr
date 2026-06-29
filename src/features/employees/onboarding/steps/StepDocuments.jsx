import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { uploadStorageFile } from '@/shared/api/storageApi';
import { DOCUMENT_TYPE_OPTIONS } from '../constants';
import { createEmptyDocumentRow, MAX_DOCUMENT_BYTES } from '../onboardingSchema';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx';

/**
 * @param {{ uploadBatchId?: string, employeeId?: string }} props
 */
export function StepDocuments({ uploadBatchId, employeeId }) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'documents' });
  const [uploadError, setUploadError] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    if (fields.length === 0) {
      append(createEmptyDocumentRow());
    }
  }, [fields.length, append]);

  const onPickFile = async (index, fileList) => {
    setUploadError('');
    const file = fileList?.[0];
    if (!file) return;

    if (file.size > MAX_DOCUMENT_BYTES) {
      setUploadError(`File exceeds ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB`);
      return;
    }

    const documentType = watch(`documents.${index}.documentType`) || 'OFFER_LETTER';

    try {
      setUploadingIndex(index);
      const result = await uploadStorageFile({
        file,
        category: employeeId ? 'employee-documents' : 'staging',
        module: 'onboarding',
        documentType,
        employeeId: employeeId || undefined,
        uploadBatchId: employeeId ? undefined : uploadBatchId,
      });

      setValue(`documents.${index}.fileName`, result.fileName, { shouldDirty: true });
      setValue(`documents.${index}.mimeType`, result.mimeType, { shouldDirty: true });
      setValue(`documents.${index}.sizeBytes`, result.sizeBytes, { shouldDirty: true });
      setValue(`documents.${index}.storageKey`, result.storageKey, { shouldDirty: true });
      setValue(`documents.${index}.dataBase64`, undefined, { shouldDirty: true });
    } catch (e) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemove = (index) => {
    if (fields.length <= 1) {
      setValue(`documents.${index}`, createEmptyDocumentRow(), { shouldDirty: true });
      return;
    }
    remove(index);
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 6
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Employee documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add documents by category — one file per row. Files are uploaded securely to cloud storage when selected.
        </Typography>
      </Box>

      <Alert severity="info">
        Allowed: PDF, images, Word. Max {MAX_DOCUMENT_BYTES / (1024 * 1024)} MB per file. Documents are optional but
        recommended for compliance.
      </Alert>

      {uploadError && <Alert severity="error">{uploadError}</Alert>}

      <Stack spacing={1.5}>
        {fields.map((fieldItem, index) => {
          const fileName = watch(`documents.${index}.fileName`);
          const sizeBytes = watch(`documents.${index}.sizeBytes`);
          const serverDocumentId = watch(`documents.${index}.serverDocumentId`);
          const storageKey = watch(`documents.${index}.storageKey`);
          const verificationStatus = watch(`documents.${index}.verificationStatus`);
          const isPersisted = Boolean(serverDocumentId);
          const isUploaded = Boolean(storageKey);
          const isUploading = uploadingIndex === index;

          return (
            <Paper
              key={fieldItem.id}
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
              }}
            >
              <Controller
                name={`documents.${index}.documentType`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    label="Document category"
                    sx={{ minWidth: { xs: '100%', sm: 220 } }}
                    error={!!errors.documents?.[index]?.documentType}
                    helperText={errors.documents?.[index]?.documentType?.message}
                    disabled={isPersisted || isUploaded || isUploading}
                  >
                    {DOCUMENT_TYPE_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Box sx={{ flex: 1, minWidth: 180 }}>
                {isPersisted ? (
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      {fileName}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip size="small" color="success" variant="outlined" label="Saved on server" />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={verificationStatus || 'PENDING'}
                      />
                      {sizeBytes > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                          {(sizeBytes / 1024).toFixed(1)} KB
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <input
                      id={`hr-doc-file-${index}`}
                      type="file"
                      accept={ACCEPT}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                      onChange={(e) => {
                        onPickFile(index, e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <Button
                      component="label"
                      htmlFor={`hr-doc-file-${index}`}
                      variant="outlined"
                      size="small"
                      startIcon={
                        isUploading ? <CircularProgress size={16} /> : <AttachFileRoundedIcon />
                      }
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading…' : isUploaded ? 'Replace file' : 'Choose file'}
                    </Button>
                    {fileName ? (
                      <Typography variant="body2" color="text.secondary">
                        {fileName} · {(sizeBytes / 1024).toFixed(1)} KB
                        {isUploaded ? ' · uploaded' : ''}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No file selected
                      </Typography>
                    )}
                  </Stack>
                )}
                {(errors.documents?.[index]?.fileName ||
                  errors.documents?.[index]?.sizeBytes ||
                  errors.documents?.[index]?.mimeType) && (
                  <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                    {errors.documents?.[index]?.fileName?.message ||
                      errors.documents?.[index]?.sizeBytes?.message ||
                      errors.documents?.[index]?.mimeType?.message}
                  </Typography>
                )}
              </Box>

              <IconButton
                edge="end"
                onClick={() => handleRemove(index)}
                aria-label="Remove document row"
                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                disabled={isUploading}
              >
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </Paper>
          );
        })}
      </Stack>

      <Box>
        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={() => append(createEmptyDocumentRow())}
        >
          Add another document
        </Button>
      </Box>

      {fields.some((_, i) => watch(`documents.${i}.fileName`) || watch(`documents.${i}.serverDocumentId`)) && (
        <Typography variant="caption" color="text.secondary">
          {fields.filter((_, i) => watch(`documents.${i}.fileName`) || watch(`documents.${i}.serverDocumentId`)).length}{' '}
          document row(s) attached.
        </Typography>
      )}
    </Stack>
  );
}
