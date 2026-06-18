import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

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
      <DialogTitle>Create custom role</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Role name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Junior Recruiter"
          error={Boolean(error)}
          helperText={error || 'A clear name helps admins assign this role correctly'}
          disabled={isPending}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          minRows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description of this role"
          helperText="Describe what this role is for and who should receive it"
          disabled={isPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
          Create role
        </Button>
      </DialogActions>
    </Dialog>
  );
}
