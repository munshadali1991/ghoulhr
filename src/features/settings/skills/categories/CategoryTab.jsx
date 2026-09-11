import { useMemo, useState } from 'react';
import { Alert, Typography } from '@mui/material';
import { CrudDataTable, StatusChipCell, ConfirmDeleteDialog } from '@/features/settings/shared';
import { formatOrgDate } from '@/features/settings/org-structure/utils/orgStructure';

export function CategoryTab({
  categories,
  isLoading,
  isSaving,
  actionError,
  onClearActionError,
  onEdit,
  onDelete,
  readOnly = false,
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
        emptyDescription="Add broad skill domains such as Software Development or Design."
        onEdit={readOnly ? undefined : onEdit}
        onDelete={readOnly || !onDelete ? undefined : setDeleteTarget}
        readOnly={readOnly}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This is only allowed when it has no subcategories or skills.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
