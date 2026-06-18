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
 *   role: import('@/features/rbac/types/rbac.types').RbacRoleDetail | null,
 *   onClose: () => void,
 *   onSubmit: (payload: { name: string, description?: string }) => Promise<void>,
 *   isPending?: boolean,
 * }} props
 */
export function EditRoleDialog({ open, role, onClose, onSubmit, isPending }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleEnter = () => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? '');
      setError('');
    }
  };

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
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err.message ?? 'Failed to update role');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle>Edit role</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Role name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(error)}
          helperText={error || 'Display name shown to administrators'}
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
          placeholder="Optional description of this role's purpose"
          helperText="Helps admins understand when to assign this role"
          disabled={isPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
