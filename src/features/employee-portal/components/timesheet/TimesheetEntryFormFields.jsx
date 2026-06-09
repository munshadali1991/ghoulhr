import { MenuItem, Stack, TextField } from '@mui/material';
import { PRIORITIES, TASK_STATUSES } from '../../constants/timesheetEnums';

/**
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<object>,
 *   errors: import('react-hook-form').FieldErrors,
 *   categories?: { id: string, name: string }[],
 * }} props
 */
export function TimesheetEntryFormFields({ register, errors, categories = [] }) {
  return (
    <Stack spacing={2.5}>
      <TextField
        label="Project"
        {...register('projectName')}
        error={Boolean(errors.projectName)}
        helperText={errors.projectName?.message}
        fullWidth
      />
      <TextField
        label="Task name"
        {...register('taskName')}
        error={Boolean(errors.taskName)}
        helperText={errors.taskName?.message}
        fullWidth
      />
      <TextField
        label="Task description"
        multiline
        minRows={3}
        {...register('taskDescription')}
        error={Boolean(errors.taskDescription)}
        helperText={errors.taskDescription?.message}
        fullWidth
      />
      <TextField
        select
        label="Category"
        {...register('categoryId')}
        error={Boolean(errors.categoryId)}
        helperText={errors.categoryId?.message}
        fullWidth
      >
        {categories.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Hours spent"
        type="number"
        inputProps={{ min: 0.25, max: 24, step: 0.25 }}
        {...register('hoursSpent')}
        error={Boolean(errors.hoursSpent)}
        helperText={errors.hoursSpent?.message}
        fullWidth
      />
      <TextField select label="Task status" {...register('taskStatus')} fullWidth>
        {TASK_STATUSES.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField select label="Priority" {...register('priority')} fullWidth>
        {PRIORITIES.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Blocker / dependency notes (optional)"
        multiline
        minRows={2}
        {...register('blockerNotes')}
        error={Boolean(errors.blockerNotes)}
        helperText={errors.blockerNotes?.message}
        fullWidth
      />
    </Stack>
  );
}
