import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { CrudButton } from '@/shared/components/ui/CrudButton';

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
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Edit role</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Role name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(error)}
          helperText={error || 'A clear name helps admins assign this role correctly.'}
          disabled={isPending}
          FormHelperTextProps={{
            sx: { mx: 0, mt: 0.75, typography: 'caption', color: error ? undefined : 'text.disabled' },
          }}
          sx={{ mb: 2 }}
        />
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <CrudButton intent="save" onClick={handleSubmit} disabled={isPending}>
          Save changes
        </CrudButton>
      </DialogActions>
    </Dialog>
  );
}
