import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { FilledByRoleSelect } from './FilledByRoleSelect';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSubmit: (payload: { title: string, role: string }) => void,
 * }} props
 */
export function CreateSectionModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('EMPLOYEE');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setRole('EMPLOYEE');
  }, [open]);

  const canSubmit = Boolean(title.trim()) && Boolean(role);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), role });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add section</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Section title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) handleSubmit();
            }}
          />
          <FilledByRoleSelect value={role} onChange={setRole} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
          Create section
        </Button>
      </DialogActions>
    </Dialog>
  );
}
