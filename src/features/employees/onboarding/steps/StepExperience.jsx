import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

function fieldError(errors, index, field) {
  return errors?.experience?.experiences?.[index]?.[field];
}

export function StepExperience() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience.experiences',
  });

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
          Previous employment background. Leave blank if not applicable. Upload supporting documents in Step 6.
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
    </Stack>
  );
}
