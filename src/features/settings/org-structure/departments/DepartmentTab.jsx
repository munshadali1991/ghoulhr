import { useMemo, useState } from 'react';
import { Alert, Typography } from '@mui/material';
import { CrudDataTable, StatusChipCell, ConfirmDeleteDialog } from '@/features/settings/shared';
import { formatOrgDate } from '../utils/orgStructure';

export function DepartmentTab({
  departments,
  isLoading,
  isSaving,
  actionError,
  onClearActionError,
  onEdit,
  onDelete,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        render: (row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.name}
          </Typography>
        ),
      },
      {
        id: 'code',
        label: 'Description',
        render: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.code?.trim() || '—'}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Created',
        render: (row) => formatOrgDate(row.createdAt),
      },
      {
        id: 'isActive',
        label: 'Status',
        render: (row) => <StatusChipCell active={row.isActive !== false} />,
      },
    ],
    [],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* surfaced via actionError */
    }
  };

  return (
    <>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <CrudDataTable
        columns={columns}
        rows={departments}
        isLoading={isLoading}
        emptyTitle="No departments yet"
        emptyDescription="Create your first department to organize teams and assign designations."
        onEdit={onEdit}
        onDelete={setDeleteTarget}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete department?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Linked designations will be unlinked or removed if they only belong to this department.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
