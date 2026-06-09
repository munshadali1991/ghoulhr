import { useMemo, useState } from 'react';
import { Alert, Typography } from '@mui/material';
import { CrudDataTable, StatusChipCell, ConfirmDeleteDialog } from '@/features/settings/shared';
import { formatOrgDate } from '@/features/settings/org-structure/utils/orgStructure';

/**
 * @param {{
 *   categories: object[],
 *   isLoading: boolean,
 *   isSaving: boolean,
 *   actionError: string,
 *   onClearActionError: () => void,
 *   onEdit: (row: object) => void,
 *   onDelete: (id: string) => Promise<void>,
 * }} props
 */
export function CategoryTab({
  categories,
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
        rows={categories}
        isLoading={isLoading}
        emptyTitle="No categories yet"
        emptyDescription="Add categories employees can select when filling their timesheet."
        onEdit={onEdit}
        onDelete={setDeleteTarget}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This is only allowed when no timesheet entries use it.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
