import { Box, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { PRIORITIES, TASK_STATUSES } from '../../constants/timesheetEnums';

export function TimesheetEntryFormBody({ categories = [] }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Work details
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Project & task
        </Typography>
        <Typography variant="body2" color="text.secondary">
          What you worked on — one timesheet per task or work item for this day.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="projectName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="Project"
                error={Boolean(errors.projectName)}
                helperText={errors.projectName?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="taskName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="Task name"
                error={Boolean(errors.taskName)}
                helperText={errors.taskName?.message}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="taskDescription"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                multiline
                minRows={3}
                label="Task description"
                error={Boolean(errors.taskDescription)}
                helperText={
                  errors.taskDescription?.message ??
                  'Describe what you accomplished during this time.'
                }
              />
            )}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Time & status
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Hours and classification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Work type, time spent, progress, and priority for this item.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth required label="Category">
                {(categories ?? []).map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="hoursSpent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                type="number"
                label="Hours spent"
                inputProps={{ min: 0.25, max: 24, step: 0.25 }}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={Boolean(errors.hoursSpent)}
                helperText={errors.hoursSpent?.message ?? 'Use 0.25 hour increments (e.g. 1.5)'}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="taskStatus"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth required label="Task status">
                {TASK_STATUSES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth required label="Priority">
                {PRIORITIES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Optional
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Blockers & dependencies
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Note anything blocking progress or dependencies on other teams.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={12}>
          <Controller
            name="blockerNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={2}
                label="Blocker / dependency notes"
                error={Boolean(errors.blockerNotes)}
                helperText={errors.blockerNotes?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
