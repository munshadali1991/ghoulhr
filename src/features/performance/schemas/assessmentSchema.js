import { z } from 'zod';
import { requiredQuestionKeys } from '../utils/assessmentForm';

/**
 * Zod schema for the employee submission step, built from the assessment snapshot.
 * Drafts skip validation entirely; only submission requires narrative + KPI answers.
 */
export function buildSubmitSchema(schema) {
  const answerShape = {};
  requiredQuestionKeys(schema).forEach((key) => {
    answerShape[key] = z
      .object({
        value: z
          .string({ required_error: 'This field is required' })
          .trim()
          .min(1, 'This field is required'),
      })
      .passthrough();
  });

  return z
    .object({
      answers: z.object(answerShape).passthrough(),
    })
    .passthrough();
}

/**
 * @param {object} values RHF values
 * @param {object} schema assessment snapshot
 * @returns {{ ok: boolean, issues: Array<{ path: string, message: string }> }}
 */
export function validateForSubmit(values, schema) {
  const result = buildSubmitSchema(schema).safeParse(values);
  if (result.success) {
    return { ok: true, issues: [] };
  }
  const issues = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
  return { ok: false, issues };
}
