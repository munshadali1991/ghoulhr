import { useCallback, useEffect, useState } from 'react';
import { useEmployeeSettings } from '@/features/settings/employees';
import {
  generateUuid,
  removeDepartmentCascade,
  sanitizeMasterData,
  validateDepartments,
  validateDesignations,
} from '../utils/orgStructure';

export function useOrgStructure(organizationId) {
  const { settings, isLoading, error, updateSettings, isUpdating, refetch } =
    useEmployeeSettings(organizationId);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    const sanitized = sanitizeMasterData(settings.departments, settings.designations);
    setDepartments(sanitized.departments);
    setDesignations(sanitized.designations);
  }, [settings, isLoading]);

  const persist = useCallback(
    async (nextDepartments, nextDesignations) => {
      const deptError = validateDepartments(nextDepartments);
      if (deptError) {
        throw new Error(deptError);
      }
      const desigError = validateDesignations(nextDesignations);
      if (desigError) {
        throw new Error(desigError);
      }

      await updateSettings({
        ...settings,
        departments: nextDepartments,
        designations: nextDesignations,
      });
    },
    [settings, updateSettings],
  );

  const saveDepartment = useCallback(
    async (payload, existingId) => {
      setActionError('');
      const record = {
        id: existingId || generateUuid(),
        name: payload.name.trim(),
        code: payload.code?.trim() || '',
        isActive: payload.isActive !== false,
        createdAt: payload.createdAt ?? null,
      };

      const nextDepartments = existingId
        ? departments.map((d) => (d.id === existingId ? { ...d, ...record } : d))
        : [...departments, record];

      try {
        await persist(nextDepartments, designations);
        return record;
      } catch (err) {
        setActionError(err.message || 'Failed to save department.');
        throw err;
      }
    },
    [departments, designations, persist],
  );

  const deleteDepartment = useCallback(
    async (departmentId) => {
      setActionError('');
      const { departments: nextDepartments, designations: nextDesignations } =
        removeDepartmentCascade(departments, designations, departmentId);

      try {
        await persist(nextDepartments, nextDesignations);
      } catch (err) {
        setActionError(err.message || 'Failed to delete department.');
        throw err;
      }
    },
    [departments, designations, persist],
  );

  const saveDesignation = useCallback(
    async (payload, existingId) => {
      setActionError('');
      const record = {
        id: existingId || generateUuid(),
        name: payload.name.trim(),
        departmentIds: [...new Set(payload.departmentIds || [])],
        isActive: payload.isActive !== false,
        createdAt: payload.createdAt ?? null,
      };

      const nextDesignations = existingId
        ? designations.map((d) => (d.id === existingId ? { ...d, ...record } : d))
        : [...designations, record];

      try {
        await persist(departments, nextDesignations);
        return record;
      } catch (err) {
        setActionError(err.message || 'Failed to save designation.');
        throw err;
      }
    },
    [departments, designations, persist],
  );

  const deleteDesignation = useCallback(
    async (designationId) => {
      setActionError('');
      const nextDesignations = designations.filter((d) => d.id !== designationId);

      try {
        await persist(departments, nextDesignations);
      } catch (err) {
        setActionError(err.message || 'Failed to delete designation.');
        throw err;
      }
    },
    [departments, designations, persist],
  );

  return {
    departments,
    designations,
    isLoading,
    isSaving: isUpdating,
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
