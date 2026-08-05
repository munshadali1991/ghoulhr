import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveLeaveRequest,
  approveTimesheetDay,
  fetchLeaveApprovalDetail,
  fetchLeaveApprovalDocument,
  fetchPendingLeaveApprovals,
  fetchTeamTimesheetDays,
  fetchTimesheetApprovalDetail,
  bulkApproveTimesheetDays,
  rejectLeaveRequest,
  rejectTimesheetDay,
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

/**
 * @param {string | null | undefined} id
 */
export function useTimesheetApprovalDetail(id) {
  return useQuery({
    queryKey: approvalsKeys.timesheetDetail(id),
    queryFn: () => fetchTimesheetApprovalDetail(id),
    enabled: Boolean(id),
  });
}

/**
 * @param {{ from: string, to: string, status?: string, employeeId?: string }} params
 * @param {{ enabled?: boolean }} [options]
 */
export function useTeamTimesheetDays(params, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: approvalsKeys.teamTimesheet(params),
    queryFn: () => fetchTeamTimesheetDays(params),
    enabled: Boolean(params.from && params.to) && enabled,
  });
}

function invalidateTimesheetApprovalQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: approvalsKeys.all });
  queryClient.invalidateQueries({ queryKey: employeePortalKeys.home() });
  queryClient.invalidateQueries({
    queryKey: [...employeePortalKeys.all, 'timesheet-day'],
  });
}

export function useApproveTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => approveTimesheetDay(id),
    onSuccess: () => invalidateTimesheetApprovalQueries(queryClient),
  });
}

export function useBulkApproveTimesheets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => bulkApproveTimesheetDays(payload),
    onSuccess: () => invalidateTimesheetApprovalQueries(queryClient),
  });
}

export function useRejectTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectTimesheetDay(id, reason),
    onSuccess: () => invalidateTimesheetApprovalQueries(queryClient),
  });
}
