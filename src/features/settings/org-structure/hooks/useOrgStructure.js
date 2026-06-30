import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  getDesignations,
  updateDepartments,
  updateDesignations,
} from '@/features/settings/api/settingsApi';
import {
  generateUuid,
  removeDepartmentCascade,
  sanitizeMasterData,
  toApiDepartment,
  toApiDesignation,
  validateDepartments,
  validateDesignations,
} from '../utils/orgStructure';

export function useOrgStructure(organizationId) {
  const queryClient = useQueryClient();
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [actionError, setActionError] = useState('');

  const departmentsQuery = useQuery({
    queryKey: ['settings', 'departments', organizationId],
    queryFn: () => getDepartments(organizationId),
    enabled: Boolean(organizationId),
  });

  const designationsQuery = useQuery({
    queryKey: ['settings', 'designations', organizationId],
    queryFn: () => getDesignations(organizationId),
    enabled: Boolean(organizationId),
  });

  const isLoading = departmentsQuery.isLoading || designationsQuery.isLoading;
  const error = departmentsQuery.error || designationsQuery.error;

  useEffect(() => {
    if (isLoading) return;
    const deptList = departmentsQuery.data?.departments ?? [];
    const desigList = designationsQuery.data?.designations ?? [];
    const sanitized = sanitizeMasterData(deptList, desigList);
    setDepartments(sanitized.departments);
    setDesignations(sanitized.designations);
  }, [departmentsQuery.data, designationsQuery.data, isLoading]);

  const departmentsMutation = useMutation({
    mutationFn: (nextDepartments) =>
      updateDepartments(organizationId, nextDepartments.map(toApiDepartment)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'departments', organizationId] });
    },
  });

  const designationsMutation = useMutation({
    mutationFn: (nextDesignations) =>
      updateDesignations(organizationId, nextDesignations.map(toApiDesignation)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'designations', organizationId] });
    },
  });

  const isSaving = departmentsMutation.isPending || designationsMutation.isPending;

  const persistDepartments = useCallback(
    async (nextDepartments, nextDesignations) => {
      const deptError = validateDepartments(nextDepartments);
      if (deptError) throw new Error(deptError);
      await departmentsMutation.mutateAsync(nextDepartments);
      if (nextDesignations) {
        const desigError = validateDesignations(nextDesignations);
        if (desigError) throw new Error(desigError);
        await designationsMutation.mutateAsync(nextDesignations);
      }
    },
    [departmentsMutation, designationsMutation],
  );

  const persistDesignations = useCallback(
    async (nextDepartments, nextDesignations) => {
      const desigError = validateDesignations(nextDesignations);
      if (desigError) throw new Error(desigError);
      await designationsMutation.mutateAsync(nextDesignations);
    },
    [designationsMutation],
  );

  const saveDepartment = useCallback(
    async (payload, existingId) => {
      setActionError('');
      const record = {
        id: existingId || generateUuid(),
        name: payload.name.trim(),
        code: payload.code?.trim() || '',
        isActive: payload.isActive !== false,
      };

      const nextDepartments = existingId
        ? departments.map((d) => (d.id === existingId ? { ...d, ...record } : d))
        : [...departments, record];

      try {
        await persistDepartments(nextDepartments, designations);
        return record;
      } catch (err) {
        setActionError(err.message || 'Failed to save department.');
        throw err;
      }
    },
    [departments, designations, persistDepartments],
  );

  const deleteDepartment = useCallback(
    async (departmentId) => {
      setActionError('');
      const { departments: nextDepartments, designations: nextDesignations } =
        removeDepartmentCascade(departments, designations, departmentId);

      try {
        await persistDepartments(nextDepartments, nextDesignations);
      } catch (err) {
        setActionError(err.message || 'Failed to delete department.');
        throw err;
      }
    },
    [departments, designations, persistDepartments],
  );

  const saveDesignation = useCallback(
    async (payload, existingId) => {
      setActionError('');
      const record = {
        id: existingId || generateUuid(),
        name: payload.name.trim(),
        departmentIds: [...new Set(payload.departmentIds || [])],
        isActive: payload.isActive !== false,
      };

      const nextDesignations = existingId
        ? designations.map((d) => (d.id === existingId ? { ...d, ...record } : d))
        : [...designations, record];

      try {
        await persistDesignations(departments, nextDesignations);
        return record;
      } catch (err) {
        setActionError(err.message || 'Failed to save designation.');
        throw err;
      }
    },
    [departments, designations, persistDesignations],
  );

  const deleteDesignation = useCallback(
    async (designationId) => {
      setActionError('');
      const nextDesignations = designations.filter((d) => d.id !== designationId);

      try {
        await persistDesignations(departments, nextDesignations);
      } catch (err) {
        setActionError(err.message || 'Failed to delete designation.');
        throw err;
      }
    },
    [departments, designations, persistDesignations],
  );

  const refetch = useCallback(() => {
    departmentsQuery.refetch();
    designationsQuery.refetch();
  }, [departmentsQuery, designationsQuery]);

  return {
    departments,
    designations,
    isLoading,
    isSaving,
    error,
    actionError,
    clearActionError: () => setActionError(''),
    refetch,
    saveDepartment,
    deleteDepartment,
    saveDesignation,
    deleteDesignation,
  };
}
