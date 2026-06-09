import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTimesheetCategory,
  deleteTimesheetCategory,
  getTimesheetCategories,
  updateTimesheetCategory,
} from '../api/timesheetCategoryApi';

const categoriesKey = (organizationId) => ['settings', 'timesheet-categories', organizationId];

/**
 * @param {string} organizationId
 */
export function useTimesheetCategories(organizationId) {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  const query = useQuery({
    queryKey: categoriesKey(organizationId),
    queryFn: () => getTimesheetCategories(organizationId),
    enabled: Boolean(organizationId),
  });

  const categories = query.data?.categories ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: categoriesKey(organizationId) });

  const clearActionError = useCallback(() => setActionError(''), []);

  const createMutation = useMutation({
    mutationFn: (payload) => createTimesheetCategory(organizationId, payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateTimesheetCategory(organizationId, id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTimesheetCategory(organizationId, id),
    onSuccess: invalidate,
  });

  const isSaving =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const saveCategory = useCallback(
    async (payload, existingId) => {
      setActionError('');
      try {
        if (existingId) {
          const res = await updateMutation.mutateAsync({
            id: existingId,
            payload: { name: payload.name, isActive: payload.isActive },
          });
          return res.category;
        }
        const res = await createMutation.mutateAsync({
          name: payload.name,
          isActive: payload.isActive ?? true,
        });
        return res.category;
      } catch (err) {
        setActionError(err.message || 'Failed to save category.');
        throw err;
      }
    },
    [createMutation, updateMutation],
  );

  const removeCategory = useCallback(
    async (id) => {
      setActionError('');
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        setActionError(err.message || 'Failed to delete category.');
        throw err;
      }
    },
    [deleteMutation],
  );

  return {
    categories,
    isLoading: query.isLoading,
    error: query.error,
    isSaving,
    actionError,
    clearActionError,
    saveCategory,
    removeCategory,
    refetch: query.refetch,
  };
}
