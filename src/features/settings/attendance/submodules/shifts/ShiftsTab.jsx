import { useMemo, useState } from 'react';
import { Alert, Typography } from '@mui/material';
import { CrudDataTable, ConfirmDeleteDialog } from '@/features/settings/shared';
import {
  formatOrgDate,
  locationLabelForId,
  shiftRowStatus,
  shiftScheduleDescription,
} from '../../utils/shifts';

export function ShiftsTab({
  shifts,
  branchLocations,
  isLoading,
  isSaving,
  actionError,
  onClearActionError,
  onEdit,
  onDelete,
  onToggleActive,
  locationsEmpty,
  readOnly = false,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        render: (row) => {
          const ready = shiftRowStatus(row) === 'ready';
          return (
            <>
              <Typography variant="body2" fontWeight={600}>
                {row.name?.trim() || 'Untitled shift'}
              </Typography>
              <Typography
                component="span"
                variant="caption"
                sx={{
                  display: 'inline-block',
                  mt: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 600,
                  bgcolor: ready ? 'success.light' : 'warning.light',
                  color: ready ? 'success.dark' : 'warning.dark',
                }}
              >
                {ready ? 'Ready' : 'Incomplete'}
              </Typography>
            </>
          );
        },
      },
      {
        id: 'schedule',
        label: 'Description',
        render: (row) => (
          <Typography variant="body2" color="text.secondary">
            {shiftScheduleDescription(row)}
            {locationLabelForId(branchLocations, row.locationId)
              ? ` · ${locationLabelForId(branchLocations, row.locationId)}`
              : ''}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Created',
        render: (row) => formatOrgDate(row.createdAt),
      },
    ],
    [branchLocations],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* actionError */
    }
  };

  if (locationsEmpty) {
    return (
      <Alert severity="warning">
        Add at least one branch under <strong>Settings → Locations</strong> before creating shifts.
      </Alert>
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
        rows={shifts}
        isLoading={isLoading}
        emptyTitle="No shifts yet"
        emptyDescription="Create shift templates for attendance expectations by branch."
        onEdit={onEdit}
        onDelete={onDelete ? setDeleteTarget : undefined}
        onToggleActive={
          onToggleActive ? (row, next) => onToggleActive(row.id, next) : undefined
        }
        toggleActiveDisabled={isSaving}
        readOnly={readOnly}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete shift?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name || 'this shift'}"?`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
