import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
import { ConfirmDeleteDialog, EmptyState } from '@/features/settings/shared';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import {
  DESIGNATION_TABLE_COLUMNS,
  ORG_TABLE_CONTAINER_SX,
  ORG_TABLE_HEADER_CELL_SX,
} from '../constants';
import { departmentNameMap } from '../utils/orgStructure';

function cellText(value) {
  const v = typeof value === 'string' ? value.trim() : value;
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

function DepartmentChips({ row, deptNames }) {
  const labels = (row.departmentIds || []).map((id) => deptNames.get(id)).filter(Boolean);
  if (!labels.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }
  const visible = labels.slice(0, 3);
  const hidden = labels.length - visible.length;
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
      {visible.map((label) => (
        <Chip key={label} size="small" label={label} variant="outlined" sx={{ height: 22 }} />
      ))}
      {hidden > 0 ? <Chip size="small" label={`+${hidden}`} sx={{ height: 22 }} /> : null}
    </Stack>
  );
}

export function DesignationTab({
  departments,
  designations,
  isLoading,
  isSaving,
  actionError,
  onClearActionError,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
  readOnly = false,
}) {
  const isMobileLayout = useIsMobileLayout();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deptNames = useMemo(() => departmentNameMap(departments), [departments]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return designations;
    return designations.filter((row) => {
      const name = String(row.name || '').toLowerCase();
      const labels = (row.departmentIds || [])
        .map((id) => deptNames.get(id) || '')
        .join(' ')
        .toLowerCase();
      return name.includes(q) || labels.includes(q);
    });
  }, [designations, searchQuery, deptNames]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* surfaced via actionError */
    }
  };

  const rowActions = (row) => (
    <TableRowActions
      readOnly={readOnly}
      onEdit={onEdit ? () => onEdit(row) : undefined}
      onDelete={onDelete ? () => setDeleteTarget(row) : undefined}
      editLabel="Edit designation"
      deleteLabel="Delete designation"
    />
  );

  if (!isLoading && departments.length === 0) {
    return (
      <SettingsSection
        icon={<WorkOutlineOutlinedIcon color="primary" />}
        title="Designations"
        description="Job titles must be linked to at least one department."
      >
        <EmptyState
          icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Add a department first"
          description="Designations must be linked to at least one department. Create a department on the Departments tab, then return here."
        />
      </SettingsSection>
    );
  }

  return (
    <>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <SettingsSection
        icon={<WorkOutlineOutlinedIcon color="primary" />}
        title="Designations"
        description="Table view stays compact at scale. Scroll inside the table to review many designations."
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {filtered.length} of {designations.length} designation
          {designations.length === 1 ? '' : 's'}
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading designations…
          </Typography>
        ) : filtered.length === 0 ? (
          searchQuery.trim() ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No designations match your search
            </Typography>
          ) : (
            <Box>
              <EmptyState
                title="No designations yet"
                description="Add job titles and map them to one or more departments."
              />
              {onAdd && !readOnly ? (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                  >
                    Add designation
                  </Button>
                </Box>
              ) : null}
            </Box>
          )
        ) : isMobileLayout ? (
          <Stack spacing={1.5}>
            {filtered.map((row, index) => (
              <MobileDataCard
                key={row.id}
                onClick={onEdit ? () => onEdit(row) : undefined}
                fields={[
                  { label: '#', value: index + 1 },
                  { label: 'Name', value: cellText(row.name) },
                  {
                    label: 'Departments',
                    value: <DepartmentChips row={row} deptNames={deptNames} />,
                  },
                  {
                    label: 'Active',
                    value: (
                      <ActiveSwitchCell
                        checked={row.isActive !== false}
                        onChange={(next) => onToggleActive?.(row.id, next)}
                        disabled={readOnly || isSaving || !onToggleActive}
                        ariaLabel={`Active for ${row.name}`}
                      />
                    ),
                  },
                ]}
                actions={rowActions(row)}
              />
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={ORG_TABLE_CONTAINER_SX}>
            <Table size="small" stickyHeader sx={{ minWidth: { xs: 0, md: 720 } }}>
              <TableHead>
                <TableRow>
                  {DESIGNATION_TABLE_COLUMNS.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align}
                      sx={{
                        ...ORG_TABLE_HEADER_CELL_SX,
                        ...(col.nowrap ? { whiteSpace: 'nowrap' } : {}),
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: onEdit ? 'pointer' : 'default' }}
                    onClick={onEdit ? () => onEdit(row) : undefined}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {cellText(row.name)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <DepartmentChips row={row} deptNames={deptNames} />
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <ActiveSwitchCell
                        checked={row.isActive !== false}
                        onChange={(next) => onToggleActive?.(row.id, next)}
                        disabled={readOnly || isSaving || !onToggleActive}
                        ariaLabel={`Active for ${row.name}`}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      className="table-actions-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {rowActions(row)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SettingsSection>

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
