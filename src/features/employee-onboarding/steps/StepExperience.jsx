import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx';
const MAX_BYTES = 4 * 1024 * 1024;

export function StepExperience() {
  const { control } = useFormContext();
  const { append } = useFieldArray({ control, name: 'documents' });
  const { fields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience.experiences',
  });

  const onFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    for (const file of files) {
      if (file.size > MAX_BYTES) continue;
      const reader = new FileReader();
      // Keep onboarding upload flow identical to the main Documents step.
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
          Previous employment background and experience proofs.
        </Typography>
      </Box>

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
                    render={({ field }) => <TextField {...field} fullWidth label="Previous company name" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.previousDesignation`}
                    control={control}
                    render={({ field }) => <TextField {...field} fullWidth label="Previous designation" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.totalExperienceYears`}
                    control={control}
                    render={({ field }) => <TextField {...field} fullWidth label="Total experience (years)" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name={`experience.experiences.${index}.lastDrawnCtc`}
                    control={control}
                    render={({ field }) => <TextField {...field} fullWidth label="Last drawn CTC" />}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    name={`experience.experiences.${index}.experienceSummary`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth multiline minRows={3} label="Experience summary" />
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
