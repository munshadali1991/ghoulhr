import { useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { ConfirmDeleteDialog, EmptyState } from '@/features/settings/shared';
import { PageCard } from '@/shared/components/ui/PageCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { shiftBarGradient } from '@/shared/theme/surfaces';
import {
  formatShiftListParts,
  loadAttendanceClockFormat,
  locationLabelForId,
  shiftRowStatus,
} from '../../utils/shifts';

function MiniWindowBar({ start, end, theme }) {
  const parse = (t) => {
    if (!t || typeof t !== 'string') return null;
    const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  };
  const s = parse(start);
  const e = parse(end);
  if (s == null || e == null) {
    return (
      <Box
        sx={{
          width: 4,
          alignSelf: 'stretch',
          minHeight: 40,
          borderRadius: 1,
          bgcolor: 'action.hover',
          flexShrink: 0,
        }}
      />
    );
  }
  let span = e - s;
  if (span <= 0) span += 24 * 60;
  const topPct = (s / (24 * 60)) * 100;
  const heightPct = Math.min(100 - topPct, Math.max((span / (24 * 60)) * 100, 8));
  return (
    <Box
      sx={{
        position: 'relative',
        width: 4,
        alignSelf: 'stretch',
        minHeight: 40,
        borderRadius: 1,
        bgcolor: 'action.hover',
        flexShrink: 0,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${topPct}%`,
          height: `${heightPct}%`,
          background: shiftBarGradient(theme),
          borderRadius: 1,
        }}
      />
    </Box>
  );
}

function ShiftCard({
  row,
  branchLocations,
  onEdit,
  onDelete,
  onToggleActive,
  toggleDisabled,
  readOnly,
}) {
  const theme = useTheme();
  const ready = shiftRowStatus(row) === 'ready';
  const location = locationLabelForId(branchLocations, row.locationId);
  const { time, net, overnight } = formatShiftListParts(row, loadAttendanceClockFormat());

  return (
    <Box
      sx={{
        px: { xs: 2, md: 2.5 },
        py: 2,
        display: 'flex',
        gap: 1.75,
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
        '&:hover': {
          bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
        },
      }}
    >
      <MiniWindowBar start={row.start_time} end={row.end_time} theme={theme} />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ letterSpacing: '-0.01em' }}>
            {row.name?.trim() || 'Untitled shift'}
          </Typography>
          <Chip
            size="small"
            label={ready ? 'Ready' : 'Incomplete'}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: ready
                ? (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(34, 197, 94, 0.16)'
                      : 'rgba(16, 185, 129, 0.12)'
                : (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(245, 158, 11, 0.16)'
                      : 'rgba(245, 158, 11, 0.12)',
              color: ready ? 'success.dark' : 'warning.dark',
              border: 0,
            }}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          spacing={0.75}
          sx={{ mt: 0.75 }}
        >
          {time ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                {time}
                {overnight ? ' · Overnight' : ''}
                {net ? ` · ${net}` : ''}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Set start and end times
            </Typography>
          )}
          {location ? (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: { sm: 0.5 } }}>
              <PlaceOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                {location}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
        {onToggleActive ? (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={row.isActive !== false}
                disabled={toggleDisabled || readOnly}
                onChange={(e) => onToggleActive(row, e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {row.isActive !== false ? 'Active' : 'Inactive'}
              </Typography>
            }
            sx={{ m: 0, mr: 0.5 }}
          />
        ) : null}
        <TableRowActions
          readOnly={readOnly}
          onEdit={onEdit ? () => onEdit(row) : undefined}
          onDelete={onDelete ? () => onDelete(row) : undefined}
        />
      </Stack>
    </Box>
  );
}

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

      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading shifts…
        </Typography>
      ) : shifts.length === 0 ? (
        <EmptyState
          title="No shifts yet"
          description="Create shift templates for attendance expectations by branch."
        />
      ) : (
        <PageCard sx={{ p: 0, overflow: 'hidden' }}>
          {shifts.map((row) => (
            <ShiftCard
              key={row.id}
              row={row}
              branchLocations={branchLocations}
              onEdit={onEdit}
              onDelete={onDelete ? setDeleteTarget : undefined}
              onToggleActive={
                onToggleActive ? (r, next) => onToggleActive(r.id, next) : undefined
              }
              toggleDisabled={isSaving}
              readOnly={readOnly}
            />
          ))}
        </PageCard>
      )}

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
