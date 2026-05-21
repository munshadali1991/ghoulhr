import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAttendanceDayDetail,
  fetchAttendanceDays,
  fetchAttendanceSummary,
  fetchEmployeeHome,
  fetchHolidayCalendar,
  fetchLeaveBalances,
  fetchLeaveCalendar,
  fetchLeaveRequests,
  fetchLeaveTransactions,
  fetchLeaveTypes,
  submitLeaveRequest,
  withdrawLeaveRequest,
} from '../api/employeePortalApi';
import { employeePortalKeys } from '../api/queryKeys';

/**
 * @param {'PENDING' | 'APPROVED'} status
 */
export function useLeaveRequests(status) {
  return useQuery({
    queryKey: employeePortalKeys.leaveRequests(status),
    queryFn: () => fetchLeaveRequests(status),
  });
}

export function useLeaveBalances(year) {
  return useQuery({
    queryKey: employeePortalKeys.leaveBalances(year),
    queryFn: () => fetchLeaveBalances(year),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: employeePortalKeys.leaveTypes(),
    queryFn: fetchLeaveTypes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaveCalendar(year, month, filter) {
  return useQuery({
    queryKey: employeePortalKeys.leaveCalendar(year, month, filter),
    queryFn: () => fetchLeaveCalendar(year, month, filter),
  });
}

export function useLeaveTransactions(date, filter, search) {
  return useQuery({
    queryKey: employeePortalKeys.leaveTransactions(date, filter),
    queryFn: () => fetchLeaveTransactions(date, filter, search),
    enabled: Boolean(date),
  });
}

export function useHolidayCalendar(year) {
  return useQuery({
    queryKey: employeePortalKeys.holidayCalendar(year),
    queryFn: () => fetchHolidayCalendar(year),
  });
}

export function useAttendanceSummary(year, month) {
  return useQuery({
    queryKey: employeePortalKeys.attendanceSummary(year, month),
    queryFn: () => fetchAttendanceSummary(year, month),
  });
}

export function useAttendanceDays(year, month) {
  return useQuery({
    queryKey: employeePortalKeys.attendanceDays(year, month),
    queryFn: () => fetchAttendanceDays(year, month),
  });
}

export function useAttendanceDayDetail(date) {
  return useQuery({
    queryKey: employeePortalKeys.attendanceDay(date),
    queryFn: () => fetchAttendanceDayDetail(date),
    enabled: Boolean(date),
  });
}

export function useEmployeeHome() {
  return useQuery({
    queryKey: employeePortalKeys.home(),
    queryFn: fetchEmployeeHome,
  });
}

export function useSubmitLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.all });
    },
  });
}

export function useWithdrawLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.all });
    },
  });
}
