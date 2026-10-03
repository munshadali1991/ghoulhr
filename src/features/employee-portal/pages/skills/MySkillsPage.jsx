import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { PageToolbar } from '../../components/PageToolbar';
import { FormSectionCard } from '../../components/FormSectionCard';
import { ConfirmDeleteDialog } from '@/features/settings/shared';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { useMySkills } from '../../hooks/useMySkills';
import {
  duplicateSkillIds,
  employeeSkillEditSchema,
  employeeSkillSchema,
} from '../../schemas/employeeSkillSchema';
import { MySkillsEditableTable } from './MySkillsEditableTable';

function toDisplayRow(skill) {
  return {
    localId: skill.id,
    id: skill.id,
    categoryId: skill.categoryId || '',
    subcategoryId: skill.subcategoryId || '',
    skillId: skill.skillId || '',
    skillName: skill.skillName || '',
    categoryName: skill.categoryName || '',
    subcategoryName: skill.subcategoryName || '',
    experienceMonths: skill.experienceMonths ?? '',
    proficiency: skill.proficiency || '',
    isEditing: false,
    isDraft: false,
  };
}

function emptyDraft() {
  return {
    localId: crypto.randomUUID(),
    id: null,
    categoryId: '',
    subcategoryId: '',
    skillId: '',
    skillName: '',
    categoryName: '',
    subcategoryName: '',
    experienceMonths: '',
    proficiency: '',
    isEditing: true,
    isDraft: true,
  };
}

function fieldErrorsFromZod(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

function catalogNames(catalog, categoryId, subcategoryId) {
  const category = catalog.find((item) => item.id === categoryId);
  const subcategory = category?.subcategories?.find((item) => item.id === subcategoryId);
  return {
    categoryName: category?.name ?? '',
    subcategoryName: subcategory?.name ?? '',
  };
}

export function MySkillsPage() {
  const { can } = useAuthorization();
  const canWrite = can('ess.skills:write');
  const { snackbar, show, close } = useAppSnackbar();
  const skillsState = useMySkills();
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setRows((prev) => {
      const savedIds = new Set(skillsState.skills.map((skill) => skill.skillId));
      const drafts = prev.filter((row) => row.isDraft && !savedIds.has(row.skillId));
      const editingById = Object.fromEntries(
        prev.filter((row) => row.id && row.isEditing).map((row) => [row.id, row]),
      );
      return [...skillsState.skills.map((skill) => editingById[skill.id] ?? toDisplayRow(skill)), ...drafts];
    });
  }, [skillsState.skills]);

  const isDirty = useMemo(() => rows.some((row) => row.isDraft || row.isEditing), [rows]);
  const duplicates = useMemo(() => duplicateSkillIds(rows), [rows]);

  const handleChange = useCallback(
    (localId, patch) => {
      skillsState.clearActionError();
      setFieldErrors((prev) => {
        if (!prev[localId]) return prev;
        const next = { ...prev };
        delete next[localId];
        return next;
      });
      setRows((prev) =>
        prev.map((row) => {
          if (row.localId !== localId) return row;
          if (patch.categoryId !== undefined) {
            const names = catalogNames(skillsState.catalog, patch.categoryId, '');
            return {
              ...row,
              categoryId: patch.categoryId,
              subcategoryId: '',
              skillId: '',
              skillName: '',
              ...names,
            };
          }
          if (patch.subcategoryId !== undefined) {
            const names = catalogNames(skillsState.catalog, row.categoryId, patch.subcategoryId);
            return {
              ...row,
              subcategoryId: patch.subcategoryId,
              skillId: '',
              skillName: '',
              subcategoryName: names.subcategoryName,
            };
          }
          return { ...row, ...patch };
        }),
      );
    },
    [skillsState.catalog, skillsState.clearActionError],
  );

  const handleAdd = () => {
    skillsState.clearActionError();
    setRows((prev) => [...prev, emptyDraft()]);
  };

  const handleDiscard = () => {
    skillsState.clearActionError();
    setFieldErrors({});
    setRows(skillsState.skills.map(toDisplayRow));
  };

  const handleStartEdit = (localId) => {
    skillsState.clearActionError();
    setRows((prev) =>
      prev.map((row) => (row.localId === localId ? { ...row, isEditing: true } : row)),
    );
  };

  const handleRemoveRow = (row) => {
    if (row.isDraft) {
      setFieldErrors((prev) => {
        if (!prev[row.localId]) return prev;
        const next = { ...prev };
        delete next[row.localId];
        return next;
      });
      setRows((prev) => prev.filter((item) => item.localId !== row.localId));
      return;
    }
    setDeleteTarget(row);
  };

  const handleSave = async () => {
    skillsState.clearActionError();
    const nextErrors = {};
    const pending = rows.filter((row) => row.isDraft || row.isEditing);

    if (duplicates.size > 0) {
      for (const row of pending) {
        if (duplicates.has(row.skillId)) {
          nextErrors[row.localId] = {
            ...(nextErrors[row.localId] || {}),
            skillId: 'This skill is already on another row',
          };
        }
      }
    }

    for (const row of pending) {
      const parsed = row.isDraft
        ? employeeSkillSchema.safeParse(row)
        : employeeSkillEditSchema.safeParse({
            experienceMonths: row.experienceMonths,
            proficiency: row.proficiency,
          });
      if (!parsed.success) {
        nextErrors[row.localId] = {
          ...(nextErrors[row.localId] || {}),
          ...fieldErrorsFromZod(parsed.error),
        };
      }
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const creates = pending
      .filter((row) => row.isDraft)
      .map((row) => ({
        skillId: row.skillId,
        experienceMonths: Number(row.experienceMonths),
        proficiency: row.proficiency,
      }));
    const updates = pending
      .filter((row) => !row.isDraft && row.id)
      .map((row) => ({
        id: row.id,
        payload: {
          experienceMonths: Number(row.experienceMonths),
          proficiency: row.proficiency,
        },
      }));

    try {
      await skillsState.saveAll({ creates, updates });
      setFieldErrors({});
      setRows((prev) =>
        prev.filter((row) => !row.isDraft).map((row) => ({ ...row, isEditing: false })),
      );
      show('Skills saved');
    } catch {
      /* actionError */
    }
  };

  if (skillsState.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box data-testid="my-skills-page">
      {skillsState.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {skillsState.error.message || 'Failed to load skills.'}
        </Alert>
      ) : null}

      <PageToolbar
        left={
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              My skills
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select skills from the company catalog and record your experience.
            </Typography>
          </Stack>
        }
      />

      <FormSectionCard title="Assigned skills" description="These skills appear on your HR profile.">
        {skillsState.actionError ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={skillsState.clearActionError}>
            {skillsState.actionError}
          </Alert>
        ) : null}

        <MySkillsEditableTable
          rows={rows}
          catalog={skillsState.catalog}
          canWrite={canWrite}
          isSaving={skillsState.isSaving}
          isDirty={isDirty}
          fieldErrors={fieldErrors}
          duplicateSkillIds={duplicates}
          onChange={handleChange}
          onAdd={handleAdd}
          onStartEdit={handleStartEdit}
          onRemoveRow={handleRemoveRow}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </FormSectionCard>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Remove skill?"
        description={
          deleteTarget ? `Remove "${deleteTarget.skillName}" from your profile?` : ''
        }
        confirmLabel="Remove"
        isDeleting={skillsState.isSaving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await skillsState.removeSkill(deleteTarget.id);
            setDeleteTarget(null);
            show('Skill removed');
          } catch {
            /* actionError */
          }
        }}
      />

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </Box>
  );
}
