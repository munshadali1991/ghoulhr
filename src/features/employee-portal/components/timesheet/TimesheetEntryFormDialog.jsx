import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { timesheetEntrySchema } from '../../schemas/timesheetEntrySchema';
import { DEFAULT_ENTRY, PRIORITIES, TASK_STATUSES } from '../../constants/timesheetEnums';

/**
 * @param {{
 *   open: boolean,
 *   initial?: object | null,
 *   onClose: () => void,
 *   onSave: (entry: object) => void,
 *   categories?: { id: string, name: string }[],
 * }} props
 */
export function TimesheetEntryFormDialog({ open, initial, onClose, onSave, categories = [] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(timesheetEntrySchema),
    defaultValues: DEFAULT_ENTRY,
  });

  useEffect(() => {
    if (open) {
      reset(initial ? { ...DEFAULT_ENTRY, ...initial } : DEFAULT_ENTRY);
    }
  }, [open, initial, reset]);

  const submit = (values) => {
    onSave({
      ...values,
      hoursSpent: Number(values.hoursSpent),
      blockerNotes: values.blockerNotes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial?.id ? 'Edit entry' : 'Add timesheet entry'}</DialogTitle>
      <form onSubmit={handleSubmit(submit)}>
        <DialogContent>
          <Stack spacing={2}>
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
              minRows={2}
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
            <TextField
              select
              label="Task status"
              {...register('taskStatus')}
              fullWidth
            >
              {TASK_STATUSES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Priority"
              {...register('priority')}
              fullWidth
            >
              {PRIORITIES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Blocker / dependency notes"
              multiline
              minRows={2}
              {...register('blockerNotes')}
              error={Boolean(errors.blockerNotes)}
              helperText={errors.blockerNotes?.message}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save entry
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
