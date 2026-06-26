import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveLeaveRequest,
  fetchLeaveApprovalDetail,
  fetchLeaveApprovalDocument,
  fetchPendingLeaveApprovals,
  rejectLeaveRequest,
} from '../api/approvalsApi';
import { approvalsKeys } from '../api/queryKeys';
import { employeePortalKeys } from '@/features/employee-portal/api/queryKeys';

export function usePendingLeaveApprovals() {
  return useQuery({
    queryKey: approvalsKeys.pendingLeave(),
    queryFn: fetchPendingLeaveApprovals,
  });
}

/**
 * @param {string | null | undefined} id
 */
export function useLeaveApprovalDetail(id) {
  return useQuery({
    queryKey: approvalsKeys.leaveDetail(id),
    queryFn: () => fetchLeaveApprovalDetail(id),
    enabled: Boolean(id),
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => approveLeaveRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalsKeys.all });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.home() });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.notificationUnreadCount() });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.leaveRequests('PENDING') });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.leaveRequests('APPROVED') });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.leaveRequests('REJECTED') });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectLeaveRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalsKeys.all });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.home() });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.notificationUnreadCount() });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.leaveRequests('PENDING') });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.leaveRequests('REJECTED') });
    },
  });
}

export function useDownloadLeaveDocument() {
  return useMutation({
    mutationFn: fetchLeaveApprovalDocument,
  });
}
