import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { MAX_DOCUMENT_BYTES } from '../onboardingSchema';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx';

function fieldError(errors, index, field) {
  return errors?.experience?.experiences?.[index]?.[field];
}

export function StepExperience() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { append } = useFieldArray({ control, name: 'documents' });
  const { fields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience.experiences',
  });
  const [uploadError, setUploadError] = useState('');

  const onFiles = async (fileList) => {
    setUploadError('');
    const files = Array.from(fileList || []);
    for (const file of files) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        setUploadError(`File "${file.name}" exceeds ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB`);
        continue;
      }
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onload = () => {
          const result = String(reader.result || '');
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          append({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            documentType: 'EXPERIENCE_PROOF',
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            dataBase64: base64,
          });
          resolve();
        };
        reader.onerror = () => reject(new Error('Read failed'));
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 3
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Experience
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Previous employment background and experience proofs. Leave blank if not applicable.
        </Typography>
      </Box>

      {uploadError && <Alert severity="error">{uploadError}</Alert>}

      <Stack spacing={2}>
        {fields.map((fieldItem, index) => (
          <Paper key={fieldItem.id} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" fontWeight={700}>
                  Experience #{index + 1}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => removeExperience(index)}
                  disabled={fields.length === 1}
                >
                  Remove
                </Button>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.previousCompanyName`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Previous company name"
                        error={!!fieldError(errors, index, 'previousCompanyName')}
                        helperText={fieldError(errors, index, 'previousCompanyName')?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.previousDesignation`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Previous designation"
                        error={!!fieldError(errors, index, 'previousDesignation')}
                        helperText={fieldError(errors, index, 'previousDesignation')?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.totalExperienceYears`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Total experience (years)"
                        error={!!fieldError(errors, index, 'totalExperienceYears')}
                        helperText={fieldError(errors, index, 'totalExperienceYears')?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.lastDrawnCtc`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Last drawn CTC"
                        error={!!fieldError(errors, index, 'lastDrawnCtc')}
                        helperText={fieldError(errors, index, 'lastDrawnCtc')?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    name={`experience.experiences.${index}.experienceSummary`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        minRows={3}
                        label="Experience summary"
                        error={!!fieldError(errors, index, 'experienceSummary')}
                        helperText={fieldError(errors, index, 'experienceSummary')?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        ))}
        <Box>
          <Button
            variant="outlined"
            onClick={() =>
              appendExperience({
                previousCompanyName: '',
                previousDesignation: '',
                totalExperienceYears: '',
                lastDrawnCtc: '',
                experienceSummary: '',
              })
            }
          >
            Add another experience
          </Button>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5, borderStyle: 'dashed', textAlign: 'center', bgcolor: 'action.hover' }}>
        <input
          id="experience-documents-file"
          type="file"
          multiple
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <UploadFileRoundedIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Add experience documents now (category auto-set to Experience proof).
        </Typography>
        <Button component="label" htmlFor="experience-documents-file" variant="outlined">
          Upload experience documents
        </Button>
      </Paper>
    </Stack>
  );
}
