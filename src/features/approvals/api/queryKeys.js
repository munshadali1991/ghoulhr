export const approvalsKeys = {
  all: ['approvals'],
  pendingLeave: () => [...approvalsKeys.all, 'pending-leave'],
  leaveDetail: (id) => [...approvalsKeys.all, 'leave-detail', id],
  pendingTimesheet: () => [...approvalsKeys.all, 'pending-timesheet'],
  timesheetDetail: (id) => [...approvalsKeys.all, 'timesheet-detail', id],
  teamTimesheet: (params) => [...approvalsKeys.all, 'team-timesheet', params],
};
