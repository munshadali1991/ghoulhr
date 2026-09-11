import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMySkill,
  getSkillCatalog,
  listMySkills,
  removeMySkill,
  updateMySkill,
} from '../api/employeeSkillsApi';
import { employeePortalKeys } from '../api/queryKeys';

export function useMySkills() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  const catalogQuery = useQuery({
    queryKey: employeePortalKeys.skillCatalog(),
    queryFn: getSkillCatalog,
  });

  const skillsQuery = useQuery({
    queryKey: employeePortalKeys.mySkills(),
    queryFn: listMySkills,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: employeePortalKeys.mySkills() });
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

  const [isSavingAll, setIsSavingAll] = useState(false);

  const addMutation = useMutation({
    mutationFn: addMySkill,
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMySkill(id, payload),
    onSuccess: invalidate,
  });
  const removeMutation = useMutation({
    mutationFn: removeMySkill,
    onSuccess: invalidate,
  });

  return {
    catalog: catalogQuery.data?.categories ?? [],
    skills: skillsQuery.data?.skills ?? [],
    isLoading: catalogQuery.isLoading || skillsQuery.isLoading,
    error: catalogQuery.error || skillsQuery.error,
    isSaving:
      isSavingAll ||
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    actionError,
    clearActionError: useCallback(() => setActionError(''), []),
    addSkill: useCallback(
      (payload) => wrap(() => addMutation.mutateAsync(payload), 'Failed to add skill.'),
      [addMutation],
    ),
    updateSkill: useCallback(
      (id, payload) =>
        wrap(() => updateMutation.mutateAsync({ id, payload }), 'Failed to update skill.'),
      [updateMutation],
    ),
    removeSkill: useCallback(
      (id) => wrap(() => removeMutation.mutateAsync(id), 'Failed to remove skill.'),
      [removeMutation],
    ),
    saveAll: useCallback(
      async ({ creates = [], updates = [] }) => {
        setActionError('');
        setIsSavingAll(true);
        try {
          for (const payload of creates) {
            await addMySkill(payload);
          }
          for (const item of updates) {
            await updateMySkill(item.id, item.payload);
          }
          await queryClient.invalidateQueries({ queryKey: employeePortalKeys.mySkills() });
        } catch (err) {
          setActionError(err.message || 'Failed to save skills.');
          await queryClient.invalidateQueries({ queryKey: employeePortalKeys.mySkills() });
          throw err;
        } finally {
          setIsSavingAll(false);
        }
      },
      [queryClient],
    ),
  };
}
