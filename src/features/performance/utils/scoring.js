import {
  maxRatingWeight,
  ratingWeightMap,
  scoredQuestionKeys,
} from './assessmentForm';

/**
 * Live aggregate KPI score from the current form values and assessment snapshot.
 * Mirrors the backend `computeAssessmentScore`.
 *
 * @param {Record<string, { value?: string }>} answers keyed by question key
 * @param {object} schema assessment snapshot
 * @returns {{ score: number, answered: number, total: number }}
 */
export function computeLiveScore(answers = {}, schema) {
  const scoredKeys = scoredQuestionKeys(schema);
  const weights = ratingWeightMap(schema);
  const maxWeight = maxRatingWeight(schema);

  const values = scoredKeys
    .map((key) => {
      const rating = answers?.[key]?.value;
      return rating ? weights[String(rating).toUpperCase()] : undefined;
    })
    .filter((w) => typeof w === 'number');

  if (values.length === 0) {
    return { score: 0, answered: 0, total: scoredKeys.length };
  }

  const total = values.reduce((sum, w) => sum + w, 0);
  const average = total / values.length;
  const scaled = (average / maxWeight) * 100;

  return {
    score: Math.round(scaled * 100) / 100,
    answered: values.length,
    total: scoredKeys.length,
  };
}
