import { useEffect, useState } from 'react';
import {
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
 *   sourceRole: import('@/features/rbac/types/rbac.types').RbacRole | null,
 *   onClose: () => void,
 *   onSubmit: (payload: { name: string, description?: string }) => Promise<void>,
 *   isPending?: boolean,
 * }} props
 */
export function CloneRoleDialog({ open, sourceRole, onClose, onSubmit, isPending }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && sourceRole) {
      setName(`${sourceRole.name} (Copy)`);
      setDescription(sourceRole.description ?? '');
      setError('');
    }
  }, [open, sourceRole]);

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
      setError(err.message ?? 'Failed to clone role');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Clone role</DialogTitle>
      <DialogContent>
        {sourceRole && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Copying permissions from <strong>{sourceRole.name}</strong> ({sourceRole.permissionCount ?? 0} permissions)
          </Typography>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="New role name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(error)}
          helperText={error || 'Choose a unique name for the cloned role.'}
          disabled={isPending}
          FormHelperTextProps={{
            sx: { mx: 0, mt: 0.75, fontSize: 11.5, color: error ? undefined : 'text.disabled' },
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
          placeholder="Optional — helps distinguish this role from the original."
          disabled={isPending}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <CrudButton intent="create" onClick={handleSubmit} disabled={isPending}>
          Clone role
        </CrudButton>
      </DialogActions>
    </Dialog>
  );
}
