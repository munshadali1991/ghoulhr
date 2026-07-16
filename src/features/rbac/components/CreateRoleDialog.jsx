import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { CrudButton } from '@/shared/components/ui/CrudButton';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSubmit: (payload: { name: string, description?: string }) => Promise<void>,
 *   isPending?: boolean,
 * }} props
 */
export function CreateRoleDialog({ open, onClose, onSubmit, isPending }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Role name is required');
      return;
    }
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      handleClose();
    } catch (err) {
      setError(err.message ?? 'Failed to create role');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Create custom role</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2.5 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Junior recruiter"
            error={Boolean(error)}
            helperText={error || 'A clear name helps admins assign this role correctly.'}
            disabled={isPending}
            FormHelperTextProps={{
              sx: { mx: 0, mt: 0.75, typography: 'caption', color: error ? undefined : 'text.disabled' },
            }}
          />
        </Box>
        <Box>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this role is for and who should receive it."
            disabled={isPending}
          />
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
            Optional — shown to admins when assigning roles.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <CrudButton intent="create" onClick={handleSubmit} disabled={isPending}>
          Create role
        </CrudButton>
      </DialogActions>
    </Dialog>
  );
}
