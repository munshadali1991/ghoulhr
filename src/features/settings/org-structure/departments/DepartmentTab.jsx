import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
import { ConfirmDeleteDialog, EmptyState } from '@/features/settings/shared';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import {
  DEPARTMENT_TABLE_COLUMNS,
  ORG_TABLE_CONTAINER_SX,
  ORG_TABLE_HEADER_CELL_SX,
} from '../constants';

function cellText(value) {
  const v = typeof value === 'string' ? value.trim() : value;
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

export function DepartmentTab({
  departments,
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

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((row) => {
      const name = String(row.name || '').toLowerCase();
      const desc = String(row.code || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [departments, searchQuery]);

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
      editLabel="Edit department"
      deleteLabel="Delete department"
    />
  );

  return (
    <>
      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearActionError}>
          {actionError}
        </Alert>
      ) : null}

      <SettingsSection
        icon={<ApartmentOutlinedIcon color="primary" />}
        title="Departments"
        description="Table view stays compact at scale. Scroll inside the table to review many departments."
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or description..."
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
          {filtered.length} of {departments.length} department
          {departments.length === 1 ? '' : 's'}
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading departments…
          </Typography>
        ) : filtered.length === 0 ? (
          searchQuery.trim() ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No departments match your search
            </Typography>
          ) : (
            <Box>
              <EmptyState
                title="No departments yet"
                description="Create your first department to organize teams and assign designations."
              />
              {onAdd && !readOnly ? (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                  >
                    Add department
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
                  { label: 'Description', value: cellText(row.code) },
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
                  {DEPARTMENT_TABLE_COLUMNS.map((col) => (
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
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 320 }}>
                        {cellText(row.code)}
                      </Typography>
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
