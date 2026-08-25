import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  fetchAttendanceDayDetail,
  fetchAttendanceDays,
  fetchAttendanceSummary,
  fetchWhoIsIn,
  fetchEmployeeSwipes,
  fetchEmployeeHome,
  fetchHolidayCalendar,
  fetchLeaveBalances,
  fetchLeaveBalanceDetail,
  fetchLeaveCalendar,
  fetchLeaveRequests,
  fetchLeaveTransactions,
  fetchTeamOnLeave,
  fetchTeamOnLeaveChart,
  fetchLeavePreview,
  fetchLeaveTypes,
  fetchColleagues,
  signInAttendance,
  signOutAttendance,
  submitLeaveRequest,
  withdrawLeaveRequest,
  fetchNotifications,
  fetchNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/employeePortalApi';
import {
  fetchTimesheetCategories,
  fetchTimesheetDay,
  fetchTimesheetReportEntries,
  fetchTimesheetReports,
  reopenTimesheetDay,
  upsertTimesheetDay,
} from '../api/timesheetApi';
import { employeePortalKeys } from '../api/queryKeys';
import { orgTodayKey } from '../utils/orgDayjs';

/**
 * @param {'PENDING' | 'APPROVED' | 'REJECTED'} status
 * @param {boolean} [enabled=true]
 */
export function useLeaveRequests(status, enabled = true) {
  return useQuery({
    queryKey: employeePortalKeys.leaveRequests(status),
    queryFn: () => fetchLeaveRequests(status),
    enabled,
  });
}

export function useLeaveBalances(year) {
  return useQuery({
    queryKey: employeePortalKeys.leaveBalances(year),
    queryFn: () => fetchLeaveBalances(year),
  });
}

/**
 * @param {string | undefined} leaveConfigurationId
 * @param {number} year
 */
export function useLeaveBalanceDetail(leaveConfigurationId, year) {
  return useQuery({
    queryKey: employeePortalKeys.leaveBalanceDetail(leaveConfigurationId, year),
    queryFn: () => fetchLeaveBalanceDetail(leaveConfigurationId, year),
    enabled: Boolean(leaveConfigurationId),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: employeePortalKeys.leaveTypes(),
    queryFn: fetchLeaveTypes,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * @param {string} search
 */
export function useColleaguesSearch(search) {
  const term = search?.trim() ?? '';
  return useQuery({
    queryKey: employeePortalKeys.colleagues(term),
    queryFn: () => fetchColleagues(term),
    staleTime: 60 * 1000,
    enabled: term.length > 0,
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
    queryKey: employeePortalKeys.leaveTransactions(date, filter, search),
    queryFn: () => fetchLeaveTransactions(date, filter, search),
    enabled: Boolean(date),
  });
}

export function useTeamOnLeave(enabled = true) {
  return useQuery({
    queryKey: employeePortalKeys.teamOnLeave(),
    queryFn: fetchTeamOnLeave,
    staleTime: 60 * 1000,
    enabled,
  });
}

/**
 * @param {{ from: string, to: string, type?: string } | null} params
 * @param {boolean} [enabled=true]
 */
export function useTeamOnLeaveChart(params, enabled = true) {
  return useQuery({
    queryKey: employeePortalKeys.teamOnLeaveChart(params ?? {}),
    queryFn: () => fetchTeamOnLeaveChart(params),
    enabled: Boolean(enabled && params?.from && params?.to),
  });
}

/**
 * @param {object | null} params
 */
export function useLeavePreview(params) {
  return useQuery({
    queryKey: employeePortalKeys.leavePreview(params),
    queryFn: () => fetchLeavePreview(params),
    enabled: Boolean(
      params?.leaveType && params?.fromDate && params?.toDate && params?.fromSession && params?.toSession,
    ),
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
  const isToday = date === dayjs().format('YYYY-MM-DD');
  return useQuery({
    queryKey: employeePortalKeys.attendanceDay(date),
    queryFn: () => fetchAttendanceDayDetail(date),
    enabled: Boolean(date),
    refetchInterval: isToday ? 60_000 : false,
  });
}

/**
 * @param {string | undefined} date YYYY-MM-DD
 * @param {boolean} [enabled=true]
 */
export function useWhoIsIn(date, enabled = true) {
  return useQuery({
    queryKey: employeePortalKeys.whoIsIn(date),
    queryFn: () => fetchWhoIsIn(date),
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const tz = data.timezone;
      const today = tz ? orgTodayKey(tz) : dayjs().format('YYYY-MM-DD');
      const effectiveDate = date || data.date;
      return effectiveDate === today ? 60_000 : false;
    },
  });
}

/**
 * @param {{ from: string, to: string, q?: string, punchType?: string, page?: number, pageSize?: number } | null} params
 * @param {boolean} [enabled=true]
 */
export function useEmployeeSwipes(params, enabled = true) {
  return useQuery({
    queryKey: employeePortalKeys.employeeSwipes(params ?? {}),
    queryFn: () => fetchEmployeeSwipes(params),
    enabled: Boolean(enabled && params?.from && params?.to),
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

function patchEmployeeHomeAttendance(queryClient, signedIn) {
  queryClient.setQueryData(employeePortalKeys.home(), (old) => {
    if (!old?.attendance) return old;
    return {
      ...old,
      attendance: { ...old.attendance, signedIn },
    };
  });
}

export function useSignInAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (signInLocation) => signInAttendance(signInLocation),
    onSuccess: (data) => {
      patchEmployeeHomeAttendance(queryClient, data?.signedIn ?? true);
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.all });
    },
  });
}

export function useSignOutAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOutAttendance,
    onSuccess: (data) => {
      patchEmployeeHomeAttendance(queryClient, data?.signedIn ?? false);
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.all });
    },
  });
}

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: employeePortalKeys.notifications(),
    queryFn: fetchNotifications,
    enabled,
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: employeePortalKeys.notificationUnreadCount(),
    queryFn: fetchNotificationUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.notifications() });
      queryClient.invalidateQueries({
        queryKey: employeePortalKeys.notificationUnreadCount(),
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.notifications() });
      queryClient.invalidateQueries({
        queryKey: employeePortalKeys.notificationUnreadCount(),
      });
    },
  });
}

/**
 * @param {string} date YYYY-MM-DD
 */
export function useTimesheetDay(date) {
  return useQuery({
    queryKey: employeePortalKeys.timesheetDay(date),
    queryFn: () => fetchTimesheetDay(date),
    enabled: Boolean(date),
  });
}

export function useTimesheetCategories() {
  return useQuery({
    queryKey: employeePortalKeys.timesheetCategories(),
    queryFn: fetchTimesheetCategories,
  });
}

/**
 * @param {{ granularity: string, from: string, to: string }} params
 */
export function useTimesheetReports(params) {
  return useQuery({
    queryKey: employeePortalKeys.timesheetReports(
      params.granularity,
      params.from,
      params.to,
    ),
    queryFn: () => fetchTimesheetReports(params),
    enabled: Boolean(params.from && params.to),
  });
}

/**
 * @param {{ from: string, to: string }} params
 */
export function useTimesheetReportEntries(params) {
  return useQuery({
    queryKey: employeePortalKeys.timesheetReportEntries(params.from, params.to),
    queryFn: () => fetchTimesheetReportEntries(params),
    enabled: Boolean(params.from && params.to),
  });
}

export function useUpsertTimesheetDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, payload }) => upsertTimesheetDay(date, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeePortalKeys.timesheetDay(variables.date),
      });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.home() });
      queryClient.invalidateQueries({ queryKey: [...employeePortalKeys.all, 'timesheet-reports'] });
      queryClient.invalidateQueries({
        queryKey: [...employeePortalKeys.all, 'timesheet-report-entries'],
      });
      queryClient.invalidateQueries({
        queryKey: employeePortalKeys.timesheetCategories(),
      });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useReopenTimesheetDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date) => reopenTimesheetDay(date),
    onSuccess: (_data, date) => {
      queryClient.invalidateQueries({
        queryKey: employeePortalKeys.timesheetDay(date),
      });
      queryClient.invalidateQueries({ queryKey: employeePortalKeys.home() });
      queryClient.invalidateQueries({ queryKey: [...employeePortalKeys.all, 'timesheet-reports'] });
      queryClient.invalidateQueries({
        queryKey: [...employeePortalKeys.all, 'timesheet-report-entries'],
      });
      queryClient.invalidateQueries({
        queryKey: employeePortalKeys.timesheetCategories(),
      });
    },
  });
}
