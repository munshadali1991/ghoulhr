export const performanceKeys = {
  all: ['performance'],
  assessments: () => [...performanceKeys.all, 'assessments'],
  reviewAssessments: (filters) => [...performanceKeys.all, 'review-assessments', filters],
  assessment: (id) => [...performanceKeys.all, 'assessment', id],
};
