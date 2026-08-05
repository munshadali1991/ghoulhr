import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAssessment,
  fetchAssessment,
  fetchMyAssessments,
  fetchReviewAssessments,
  saveAssessmentDraft,
  saveHrReview,
  saveManagerReview,
  saveRoleReview,
  submitAssessment,
} from '../api/performanceApi';
import { performanceKeys } from '../api/queryKeys';

export function useMyAssessments() {
  return useQuery({
    queryKey: performanceKeys.assessments(),
    queryFn: fetchMyAssessments,
  });
}

/**
 * @param {{ status?: string, search?: string }} filters
 */
export function useReviewAssessments(filters = {}) {
  return useQuery({
    queryKey: performanceKeys.reviewAssessments(filters),
    queryFn: () => fetchReviewAssessments(filters),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.assessments() });
      queryClient.invalidateQueries({ queryKey: [...performanceKeys.all, 'review-assessments'] });
    },
  });
}

export function useAssessment(id) {
  return useQuery({
    queryKey: performanceKeys.assessment(id),
    queryFn: () => fetchAssessment(id),
    enabled: Boolean(id),
  });
}

function useAssessmentMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.assessments() });
      if (variables?.id) {
        queryClient.setQueryData(performanceKeys.assessment(variables.id), data);
      }
    },
  });
}

export function useSaveAssessmentDraft() {
  return useAssessmentMutation(({ id, payload }) => saveAssessmentDraft(id, payload));
}

export function useSubmitAssessment() {
  return useAssessmentMutation(({ id, payload }) => submitAssessment(id, payload));
}

export function useSaveManagerReview() {
  return useAssessmentMutation(({ id, payload }) => saveManagerReview(id, payload));
}

export function useSaveHrReview() {
  return useAssessmentMutation(({ id, payload }) => saveHrReview(id, payload));
}

export function useSaveRoleReview() {
  return useAssessmentMutation(({ id, roleCode, payload }) =>
    saveRoleReview(id, roleCode, payload),
  );
}
