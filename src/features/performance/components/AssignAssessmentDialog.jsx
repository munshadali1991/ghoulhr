import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { listEmployees } from '@/features/employees/api/employeesApi';
import { useCreateAssessment } from '../hooks/usePerformanceQueries';
import { CrudButton } from '@/shared/components/ui/CrudButton';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSuccess?: () => void,
 * }} props
 */
export function AssignAssessmentDialog({ open, onClose, onSuccess }) {
  const [employee, setEmployee] = useState(null);
  const [cycleLabel, setCycleLabel] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'list'],
    queryFn: listEmployees,
    enabled: open,
  });

  const createMutation = useCreateAssessment();

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(employeesData) ? employeesData : [];
    return list
      .filter((e) => e.status !== 'TERMINATED')
      .map((e) => ({
        id: e.id,
        label: `${e.name} (${e.employeeCode})`,
        name: e.name,
        employeeCode: e.employeeCode,
      }));
  }, [employeesData]);

  useEffect(() => {
    if (!open) return;
    setEmployee(null);
    setCycleLabel('');
    setDescription('');
    setDueDate('');
    setError('');
  }, [open]);

  const handleSubmit = async () => {
    setError('');
    if (!employee?.id) {
      setError('Select an employee.');
      return;
    }
    if (!cycleLabel.trim()) {
      setError('Cycle label is required.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        employeeId: employee.id,
        cycleLabel: cycleLabel.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Unable to assign assessment.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign assessment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Assign a performance review cycle to an employee. They will see it under My assessments.
          </Typography>

          <Autocomplete
            options={employeeOptions}
            loading={employeesLoading}
            value={employee}
            onChange={(_, value) => setEmployee(value)}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField {...params} label="Employee" required />
            )}
          />

          <TextField
            label="Cycle label"
            required
            value={cycleLabel}
            onChange={(e) => setCycleLabel(e.target.value)}
            placeholder="Annual Performance Review - 2026"
          />

          <TextField
            label="Description"
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <CrudButton
          intent="create"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          Assign
        </CrudButton>
      </DialogActions>
    </Dialog>
  );
}
