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

export function SkillTab({
  categories,
  subcategories,
  skills,
  categoryId,
  subcategoryId,
  onCategoryIdChange,
  onSubcategoryIdChange,
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

  const filteredSkills = useMemo(() => {
    return skills.filter((row) => {
      if (categoryId && row.categoryId !== categoryId) return false;
      if (subcategoryId && row.subcategoryId !== subcategoryId) return false;
      return true;
    });
  }, [skills, categoryId, subcategoryId]);

  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Skill',
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
        id: 'subcategoryName',
        label: 'Subcategory',
        render: (row) => row.subcategoryName || '—',
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
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="skill-master-category-filter">Category</InputLabel>
          <Select
            labelId="skill-master-category-filter"
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
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="skill-master-subcategory-filter">Subcategory</InputLabel>
          <Select
            labelId="skill-master-subcategory-filter"
            label="Subcategory"
            value={subcategoryId || ''}
            onChange={(event) => onSubcategoryIdChange(event.target.value || '')}
          >
            <MenuItem value="">All subcategories</MenuItem>
            {filteredSubcategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <CrudDataTable
        columns={columns}
        rows={filteredSkills}
        isLoading={isLoading}
        emptyTitle="No skills yet"
        emptyDescription="Add skills such as React or PostgreSQL under a subcategory."
        onEdit={readOnly ? undefined : onEdit}
        onDelete={readOnly || !onDelete ? undefined : setDeleteTarget}
        readOnly={readOnly}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete skill?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This is only allowed when no employees have assigned it.`
            : ''
        }
        isDeleting={isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
