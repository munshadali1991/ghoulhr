export const approvalsKeys = {
  all: ['approvals'],
  pendingLeave: () => [...approvalsKeys.all, 'pending-leave'],
  leaveDetail: (id) => [...approvalsKeys.all, 'leave-detail', id],
};
