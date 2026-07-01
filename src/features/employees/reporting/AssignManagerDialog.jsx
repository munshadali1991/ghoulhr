import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { assignReportingManager } from '@/features/employees/api/reportingManagersApi';

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onSuccess: (result?: { succeededCount?: number; failedCount?: number }) => void;
 *   employees: { id: string; name: string; employeeCode: string; status?: string }[];
 *   managerCandidates: { id: string; name: string; employeeCode: string; status?: string }[];
 *   candidatesError?: string;
 *   initialEmployee?: { employeeId: string; employeeName: string; employeeCode: string } | null;
 *   initialManager?: { id: string; name: string; employeeCode: string } | null;
 *   selectedEmployees?: { employeeId: string; employeeName: string; employeeCode: string }[];
 * }} props
 */
export function AssignManagerDialog({
  open,
  onClose,
  onSuccess,
  employees,
  managerCandidates = [],
  candidatesError = '',
  initialEmployee = null,
  initialManager = null,
  selectedEmployees = null,
}) {
  const [employee, setEmployee] = useState(null);
  const [manager, setManager] = useState(null);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isBulk = Boolean(selectedEmployees?.length);
  const bulkList = selectedEmployees ?? [];

  const activeEmployees = useMemo(
    () =>
      (employees || []).filter((e) => e.status !== 'TERMINATED').map((e) => ({
        id: e.id,
        label: `${e.name} (${e.employeeCode})`,
        name: e.name,
        employeeCode: e.employeeCode,
      })),
    [employees],
  );

  const activeManagerCandidates = useMemo(
    () =>
      (managerCandidates || [])
        .filter((e) => e.status !== 'TERMINATED')
        .map((e) => ({
          id: e.id,
          label: `${e.name} (${e.employeeCode})`,
          name: e.name,
          employeeCode: e.employeeCode,
        })),
    [managerCandidates],
  );

  const excludedManagerIds = useMemo(() => {
    if (isBulk) {
      return new Set(bulkList.map((e) => e.employeeId));
    }
    if (employee?.id) {
      return new Set([employee.id]);
    }
    return new Set();
  }, [isBulk, bulkList, employee]);

  const managerOptions = useMemo(
    () =>
      activeManagerCandidates.filter((e) => !excludedManagerIds.has(e.id)),
    [activeManagerCandidates, excludedManagerIds],
  );

  const bulkSummary = useMemo(() => {
    if (!isBulk) return '';
    const names = bulkList.map((e) => e.employeeName);
    if (names.length <= 3) {
      return names.join(', ');
    }
    return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
  }, [isBulk, bulkList]);

  useEffect(() => {
    if (!open) return;
    setError('');
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    if (!isBulk && initialEmployee) {
      const match =
        activeEmployees.find((e) => e.id === initialEmployee.employeeId) || {
          id: initialEmployee.employeeId,
          label: `${initialEmployee.employeeName} (${initialEmployee.employeeCode})`,
        };
      setEmployee(match);
    } else {
      setEmployee(null);
    }
    if (initialManager) {
      const match =
        managerOptions.find((e) => e.id === initialManager.id) || {
          id: initialManager.id,
          label: `${initialManager.name} (${initialManager.employeeCode})`,
        };
      setManager(match);
    } else {
      setManager(null);
    }
  }, [open, isBulk, initialEmployee, initialManager, activeEmployees, managerOptions]);

  const handleSubmit = async () => {
    setError('');
    if (!isBulk && !employee?.id) {
      setError('Select an employee');
      return;
    }
    if (!manager?.id) {
      setError('Select a reporting manager');
      return;
    }
    setSubmitting(true);
    try {
      if (isBulk) {
        const results = await Promise.allSettled(
          bulkList.map((emp) =>
            assignReportingManager(emp.employeeId, {
              managerEmployeeId: manager.id,
              effectiveFrom: effectiveFrom || undefined,
            }),
          ),
        );
        const failed = results.filter((r) => r.status === 'rejected');
        const succeeded = results.length - failed.length;

        if (succeeded === 0) {
          const firstErr = failed[0]?.reason;
          setError(
            firstErr?.message ||
              `Failed to assign reporting manager for all ${bulkList.length} employees`,
          );
          return;
        }

        if (failed.length > 0) {
          const firstErr = failed[0]?.reason;
          setError(
            `${failed.length} of ${bulkList.length} failed${firstErr?.message ? `: ${firstErr.message}` : ''}`,
          );
          onSuccess({ succeededCount: succeeded, failedCount: failed.length });
          return;
        }

        onSuccess({ succeededCount: succeeded, failedCount: 0 });
        onClose();
        return;
      }

      await assignReportingManager(employee.id, {
        managerEmployeeId: manager.id,
        effectiveFrom: effectiveFrom || undefined,
      });
      onSuccess({ succeededCount: 1, failedCount: 0 });
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to assign reporting manager');
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = isBulk
    ? `Assign reporting manager (${bulkList.length} employees)`
    : initialManager
      ? 'Change reporting manager'
      : 'Assign reporting manager';

  const hideEmployeeField = isBulk || Boolean(initialEmployee);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {isBulk ? (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Assigning the same reporting manager to:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {bulkSummary}
              </Typography>
            </Box>
          ) : null}
          {!hideEmployeeField ? (
            <Autocomplete
              value={employee}
              onChange={(_, v) => setEmployee(v)}
              options={activeEmployees}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(params) => (
                <TextField {...params} label="Employee" required />
              )}
            />
          ) : null}
          <Autocomplete
            value={manager}
            onChange={(_, v) => setManager(v)}
            options={managerOptions}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Reporting manager" required />
            )}
          />
          {candidatesError ? (
            <Typography variant="body2" color="error">
              {candidatesError}
            </Typography>
          ) : null}
          {managerOptions.length === 0 && !candidatesError ? (
            <Typography variant="body2" color="text.secondary">
              No employees with the Manager role. Assign the Manager role in
              Settings → RBAC → Employees.
            </Typography>
          ) : null}
          <TextField
            label="Effective from"
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Assigning…' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

