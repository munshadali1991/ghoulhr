import { useMemo, useState } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { CrudDataTable, StatusChipCell, ConfirmDeleteDialog } from '@/features/settings/shared';
import { formatOrgDate } from '@/features/settings/org-structure/utils/orgStructure';

export function SubcategoryTab({
  categories,
  subcategories,
  categoryId,
  onCategoryIdChange,
  isLoading,
  isSaving,
  actionError,
  onClearActionError,
  onEdit,
  onDelete,
  readOnly = false,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredSubcategories = useMemo(() => {
    if (!categoryId) return subcategories;
    return subcategories.filter((row) => row.categoryId === categoryId);
  }, [subcategories, categoryId]);

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
        id: 'categoryName',
        label: 'Category',
        render: (row) => row.categoryName || '—',
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="skill-subcategory-category-filter">Category</InputLabel>
          <Select
            labelId="skill-subcategory-category-filter"
            label="Category"
            value={categoryId || ''}
            onChange={(event) => onCategoryIdChange(event.target.value || '')}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <CrudDataTable
        columns={columns}
        rows={filteredSubcategories}
        isLoading={isLoading}
        emptyTitle="No subcategories yet"
        emptyDescription="Add sub-fields such as Frontend or Backend under a category."
        onEdit={readOnly ? undefined : onEdit}
        onDelete={readOnly || !onDelete ? undefined : setDeleteTarget}
        readOnly={readOnly}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete subcategory?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This is only allowed when it has no skills.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
