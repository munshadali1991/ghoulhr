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
  locationsEmpty,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        render: (row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.name?.trim() || 'Untitled shift'}
          </Typography>
        ),
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
      {
        id: 'status',
        label: 'Status',
        render: (row) => {
          const ready = shiftRowStatus(row) === 'ready';
          return (
            <Typography
              component="span"
              variant="caption"
              sx={{
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
          );
        },
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
        emptyTitle="No shifts configured"
        emptyDescription="Define shift templates with start/end times and branch locations for attendance tracking."
        onEdit={onEdit}
        onDelete={setDeleteTarget}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete shift?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Employees assigned to this shift pattern may need reassignment.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
