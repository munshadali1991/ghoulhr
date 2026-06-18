import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cloneRbacRole,
  createRbacRole,
  deactivateRbacRole,
  getRbacRole,
  listRbacAuditLogs,
  listRbacPermissions,
  listRbacRoles,
  updateRbacRole,
  updateRolePermissions,
  assignEmployeeRoles,
} from '@/features/rbac/api/rbacApi';

export function useRbacRoles() {
  return useQuery({
    queryKey: ['rbac', 'roles'],
    queryFn: listRbacRoles,
  });
}

export function useRbacPermissions() {
  return useQuery({
    queryKey: ['rbac', 'permissions'],
    queryFn: listRbacPermissions,
  });
}

export function useRbacRoleDetail(roleId) {
  return useQuery({
    queryKey: ['rbac', 'roles', roleId],
    queryFn: () => getRbacRole(roleId),
    enabled: Boolean(roleId),
  });
}

/**
 * @param {{ page?: number, limit?: number, action?: string }} [params]
 */
export function useRbacAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['rbac', 'audit-logs', params],
    queryFn: () => listRbacAuditLogs(params),
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissions }) =>
      updateRolePermissions(roleId, permissions),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles', roleId] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'audit-logs'] });
    },
  });
}

export function useCreateRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRbacRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'audit-logs'] });
    },
  });
}

export function useUpdateRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, ...payload }) => updateRbacRole(roleId, payload),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles', roleId] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'audit-logs'] });
    },
  });
}

export function useDeactivateRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateRbacRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'audit-logs'] });
    },
  });
}

export function useCloneRbacRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, name, description }) =>
      cloneRbacRole(roleId, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'audit-logs'] });
    },
  });
}

export function useAssignEmployeeRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, roleIds, primaryRoleId }) =>
      assignEmployeeRoles(employeeId, roleIds, primaryRoleId),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'employee-roles', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'all-employee-roles'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'audit-logs'] });
    },
  });
}
