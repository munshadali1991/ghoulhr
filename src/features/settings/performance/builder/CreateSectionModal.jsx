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
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { FilledByRoleSelect } from './FilledByRoleSelect';
import { CrudButton } from '@/shared/components/ui/CrudButton';

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
      <DialogTitle sx={{ fontWeight: 700 }}>Add section</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Section title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
            placeholder="e.g. Peer feedback"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) handleSubmit();
            }}
          />
          <FilledByRoleSelect value={role} onChange={setRole} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} color="inherit">
          Cancel
        </Button>
        <CrudButton
          intent="create"
          startIcon={<CheckRoundedIcon />}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Create section
        </CrudButton>
      </DialogActions>
    </Dialog>
  );
}
