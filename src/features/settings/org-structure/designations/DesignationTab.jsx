import { useMemo, useState } from 'react';
import { Alert, Box, Chip, Typography } from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { CrudDataTable, StatusChipCell, ConfirmDeleteDialog, EmptyState } from '@/features/settings/shared';
import { departmentNameMap, formatOrgDate } from '../utils/orgStructure';

export function DesignationTab({
  departments,
  designations,
  isLoading,
  isSaving,
  actionError,
  onClearActionError,
  onEdit,
  onDelete,
  readOnly = false,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deptNames = useMemo(() => departmentNameMap(departments), [departments]);

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
        id: 'departments',
        label: 'Description',
        render: (row) => {
          const labels = (row.departmentIds || [])
            .map((id) => deptNames.get(id))
            .filter(Boolean);
          if (!labels.length) {
            return (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            );
          }
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {labels.map((label) => (
                <Chip key={label} size="small" label={label} variant="outlined" />
              ))}
            </Box>
          );
        },
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
    [deptNames],
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

  if (!isLoading && departments.length === 0) {
    return (
      <EmptyState
        icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 40 }} />}
        title="Add a department first"
        description="Designations must be linked to at least one department. Create a department on the Departments tab, then return here."
      />
    );
  }

  return (
    <>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <CrudDataTable
        columns={columns}
        rows={designations}
        isLoading={isLoading}
        emptyTitle="No designations yet"
        emptyDescription="Add job titles and map them to one or more departments."
        onEdit={onEdit}
        onDelete={setDeleteTarget}
        readOnly={readOnly}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete designation?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
