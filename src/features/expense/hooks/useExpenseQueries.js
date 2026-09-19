import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/expenseApi';

export const expenseKeys = {
  all: ['expense'],
  categories: () => [...expenseKeys.all, 'categories'],
  claims: (status) => [...expenseKeys.all, 'claims', status ?? 'all'],
  claim: (id) => [...expenseKeys.all, 'claim', id],
  managerPending: () => [...expenseKeys.all, 'manager-pending'],
  managerDetail: (id) => [...expenseKeys.all, 'manager-detail', id],
  financePending: () => [...expenseKeys.all, 'finance-pending'],
  payable: () => [...expenseKeys.all, 'payable'],
  financeDetail: (id) => [...expenseKeys.all, 'finance-detail', id],
  adminCategories: () => [...expenseKeys.all, 'admin-categories'],
  policy: () => [...expenseKeys.all, 'policy'],
};

export function useExpenseCategories(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: api.listExpenseCategories,
    enabled,
  });
}

export function useOwnExpenseClaims(status, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.claims(status),
    queryFn: () => api.listOwnExpenseClaims(status),
    enabled,
  });
}

export function useOwnExpenseClaim(id, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.claim(id),
    queryFn: () => api.getOwnExpenseClaim(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateExpenseClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createExpenseClaim,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useUpdateExpenseClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateExpenseClaim(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useAddExpenseLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ claimId, payload }) => api.addExpenseLine(claimId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useUpdateExpenseLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ claimId, lineId, payload }) =>
      api.updateExpenseLine(claimId, lineId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useDeleteExpenseLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ claimId, lineId }) => api.deleteExpenseLine(claimId, lineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useSubmitExpenseClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitExpenseClaim,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useWithdrawExpenseClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.withdrawExpenseClaim,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function usePendingExpenseApprovals(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.managerPending(),
    queryFn: api.listPendingExpenseApprovals,
    enabled,
  });
}

export function useExpenseApprovalDetail(id, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.managerDetail(id),
    queryFn: () => api.getExpenseApprovalDetail(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useManagerExpenseActions() {
  const qc = useQueryClient();

  /** @param {string} id */
  const removeFromPending = (id) => {
    qc.setQueryData(expenseKeys.managerPending(), (old) => {
      if (!Array.isArray(old)) return old;
      return old.filter((claim) => claim.id !== id);
    });
    return qc.invalidateQueries({ queryKey: expenseKeys.all });
  };

  return {
    approve: useMutation({
      mutationFn: ({ id, notes }) => api.approveExpenseAsManager(id, notes),
      onSuccess: (_data, { id }) => removeFromPending(id),
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }) => api.rejectExpenseAsManager(id, reason),
      onSuccess: (_data, { id }) => removeFromPending(id),
    }),
    sendBack: useMutation({
      mutationFn: ({ id, reason }) => api.sendBackExpenseAsManager(id, reason),
      onSuccess: (_data, { id }) => removeFromPending(id),
    }),
  };
}

export function useManagerExpenseReceipt() {
  return useMutation({
    mutationFn: ({ claimId, lineId }) =>
      api.getManagerExpenseReceipt(claimId, lineId),
  });
}

export function useFinancePending(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.financePending(),
    queryFn: api.listFinancePendingClaims,
    enabled,
  });
}

export function usePayableClaims(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.payable(),
    queryFn: api.listPayableClaims,
    enabled,
  });
}

export function useFinanceClaimDetail(id, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.financeDetail(id),
    queryFn: () => api.getFinanceClaimDetail(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useFinanceExpenseActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: expenseKeys.all });
  return {
    approve: useMutation({
      mutationFn: ({ id, notes }) => api.approveExpenseAsFinance(id, notes),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }) => api.rejectExpenseAsFinance(id, reason),
      onSuccess: invalidate,
    }),
    sendBack: useMutation({
      mutationFn: ({ id, reason }) => api.sendBackExpenseAsFinance(id, reason),
      onSuccess: invalidate,
    }),
    markPaid: useMutation({
      mutationFn: ({ id, payload }) => api.markExpensePaid(id, payload),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminExpenseCategories(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.adminCategories(),
    queryFn: api.listAdminExpenseCategories,
    enabled,
  });
}

export function useSaveAdminExpenseCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveAdminExpenseCategories,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useExpensePolicy(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.policy(),
    queryFn: api.getExpensePolicy,
    enabled,
  });
}

export function useSaveExpensePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveExpensePolicy,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.policy() }),
  });
}
