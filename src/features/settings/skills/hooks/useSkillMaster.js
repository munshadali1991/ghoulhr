import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSkill,
  createSkillCategory,
  createSkillSubcategory,
  deleteSkill,
  deleteSkillCategory,
  deleteSkillSubcategory,
  listSkillCategories,
  listSkillSubcategories,
  listSkills,
  updateSkill,
  updateSkillCategory,
  updateSkillSubcategory,
} from '../api/skillsMasterApi';

const categoriesKey = (organizationId) => ['settings', 'skill-categories', organizationId];
const subcategoriesKey = (organizationId) => ['settings', 'skill-subcategories', organizationId];
const skillsKey = (organizationId) => ['settings', 'skills', organizationId];

/**
 * @param {string} organizationId
 */
export function useSkillMaster(organizationId) {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  const categoriesQuery = useQuery({
    queryKey: categoriesKey(organizationId),
    queryFn: () => listSkillCategories(organizationId),
    enabled: Boolean(organizationId),
  });

  const subcategoriesQuery = useQuery({
    queryKey: subcategoriesKey(organizationId),
    queryFn: () => listSkillSubcategories(organizationId),
    enabled: Boolean(organizationId),
  });

  const skillsQuery = useQuery({
    queryKey: skillsKey(organizationId),
    queryFn: () => listSkills(organizationId),
    enabled: Boolean(organizationId),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: categoriesKey(organizationId) });
    queryClient.invalidateQueries({ queryKey: subcategoriesKey(organizationId) });
    queryClient.invalidateQueries({ queryKey: skillsKey(organizationId) });
  };

  const wrap = async (fn, fallback) => {
    setActionError('');
    try {
      return await fn();
    } catch (err) {
      setActionError(err.message || fallback);
      throw err;
    }
  };

  const categoryCreate = useMutation({
    mutationFn: (payload) => createSkillCategory(organizationId, payload),
    onSuccess: invalidateAll,
  });
  const categoryUpdate = useMutation({
    mutationFn: ({ id, payload }) => updateSkillCategory(organizationId, id, payload),
    onSuccess: invalidateAll,
  });
  const categoryDelete = useMutation({
    mutationFn: (id) => deleteSkillCategory(organizationId, id),
    onSuccess: invalidateAll,
  });

  const subcategoryCreate = useMutation({
    mutationFn: (payload) => createSkillSubcategory(organizationId, payload),
    onSuccess: invalidateAll,
  });
  const subcategoryUpdate = useMutation({
    mutationFn: ({ id, payload }) => updateSkillSubcategory(organizationId, id, payload),
    onSuccess: invalidateAll,
  });
  const subcategoryDelete = useMutation({
    mutationFn: (id) => deleteSkillSubcategory(organizationId, id),
    onSuccess: invalidateAll,
  });

  const skillCreate = useMutation({
    mutationFn: (payload) => createSkill(organizationId, payload),
    onSuccess: invalidateAll,
  });
  const skillUpdate = useMutation({
    mutationFn: ({ id, payload }) => updateSkill(organizationId, id, payload),
    onSuccess: invalidateAll,
  });
  const skillDelete = useMutation({
    mutationFn: (id) => deleteSkill(organizationId, id),
    onSuccess: invalidateAll,
  });

  const isSaving =
    categoryCreate.isPending ||
    categoryUpdate.isPending ||
    categoryDelete.isPending ||
    subcategoryCreate.isPending ||
    subcategoryUpdate.isPending ||
    subcategoryDelete.isPending ||
    skillCreate.isPending ||
    skillUpdate.isPending ||
    skillDelete.isPending;

  const saveCategory = useCallback(
    async (payload, existingId) =>
      wrap(async () => {
        if (existingId) {
          const res = await categoryUpdate.mutateAsync({
            id: existingId,
            payload: { name: payload.name, isActive: payload.isActive },
          });
          return res.category;
        }
        const res = await categoryCreate.mutateAsync({
          name: payload.name,
          isActive: payload.isActive ?? true,
        });
        return res.category;
      }, 'Failed to save category.'),
    [categoryCreate, categoryUpdate],
  );

  const removeCategory = useCallback(
    async (id) => wrap(() => categoryDelete.mutateAsync(id), 'Failed to delete category.'),
    [categoryDelete],
  );

  const toggleCategoryActive = useCallback(
    async (row, nextActive) =>
      wrap(
        () =>
          categoryUpdate.mutateAsync({
            id: row.id,
            payload: { isActive: nextActive },
          }),
        'Failed to update category.',
      ),
    [categoryUpdate],
  );

  const saveSubcategory = useCallback(
    async (payload, existingId) =>
      wrap(async () => {
        if (existingId) {
          const res = await subcategoryUpdate.mutateAsync({
            id: existingId,
            payload: {
              name: payload.name,
              categoryId: payload.categoryId,
              isActive: payload.isActive,
            },
          });
          return res.subcategory;
        }
        const res = await subcategoryCreate.mutateAsync({
          name: payload.name,
          categoryId: payload.categoryId,
          isActive: payload.isActive ?? true,
        });
        return res.subcategory;
      }, 'Failed to save subcategory.'),
    [subcategoryCreate, subcategoryUpdate],
  );

  const removeSubcategory = useCallback(
    async (id) =>
      wrap(() => subcategoryDelete.mutateAsync(id), 'Failed to delete subcategory.'),
    [subcategoryDelete],
  );

  const toggleSubcategoryActive = useCallback(
    async (row, nextActive) =>
      wrap(
        () =>
          subcategoryUpdate.mutateAsync({
            id: row.id,
            payload: { isActive: nextActive },
          }),
        'Failed to update subcategory.',
      ),
    [subcategoryUpdate],
  );

  const saveSkill = useCallback(
    async (payload, existingId) =>
      wrap(async () => {
        if (existingId) {
          const res = await skillUpdate.mutateAsync({
            id: existingId,
            payload: {
              name: payload.name,
              subcategoryId: payload.subcategoryId,
              isActive: payload.isActive,
            },
          });
          return res.skill;
        }
        const res = await skillCreate.mutateAsync({
          name: payload.name,
          subcategoryId: payload.subcategoryId,
          isActive: payload.isActive ?? true,
        });
        return res.skill;
      }, 'Failed to save skill.'),
    [skillCreate, skillUpdate],
  );

  const removeSkill = useCallback(
    async (id) => wrap(() => skillDelete.mutateAsync(id), 'Failed to delete skill.'),
    [skillDelete],
  );

  const toggleSkillActive = useCallback(
    async (row, nextActive) =>
      wrap(
        () =>
          skillUpdate.mutateAsync({
            id: row.id,
            payload: { isActive: nextActive },
          }),
        'Failed to update skill.',
      ),
    [skillUpdate],
  );

  return {
    categories: categoriesQuery.data?.categories ?? [],
    subcategories: subcategoriesQuery.data?.subcategories ?? [],
    skills: skillsQuery.data?.skills ?? [],
    isLoading:
      categoriesQuery.isLoading || subcategoriesQuery.isLoading || skillsQuery.isLoading,
    error: categoriesQuery.error || subcategoriesQuery.error || skillsQuery.error,
    isSaving,
    actionError,
    clearActionError: useCallback(() => setActionError(''), []),
    saveCategory,
    removeCategory,
    toggleCategoryActive,
    saveSubcategory,
    removeSubcategory,
    toggleSubcategoryActive,
    saveSkill,
    removeSkill,
    toggleSkillActive,
  };
}
