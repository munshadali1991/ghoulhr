import { QUESTION_TYPES, normalizeSectionRoleCode } from '../constants/performanceEnums';

const RATING_TYPES = [QUESTION_TYPES.RATING];
const NUMBER_TYPES = [QUESTION_TYPES.NUMBER];
const TEXT_TYPES = [
  QUESTION_TYPES.TEXT,
  QUESTION_TYPES.TEXTAREA,
  QUESTION_TYPES.NARRATIVE,
  QUESTION_TYPES.SELECT,
  QUESTION_TYPES.RADIO,
];

function emptyAnswer() {
  return { value: '', comment: '' };
}

function normalizeQuestionType(type) {
  if (type === QUESTION_TYPES.NARRATIVE) return QUESTION_TYPES.TEXTAREA;
  return type;
}

/** Flatten all questions from a snapshot schema. */
export function flattenQuestions(schema) {
  if (!schema?.sections?.length) return [];
  return schema.sections.flatMap((section) =>
    (section.questions ?? []).map((question) => ({
      ...question,
      type: normalizeQuestionType(question.type),
      section: section.key,
      fillRole: section.role,
    })),
  );
}

/** Build empty RHF default values from a snapshot schema. */
export function getDefaultFormValues(schema) {
  const answers = {};
  flattenQuestions(schema).forEach((q) => {
    answers[q.key] = emptyAnswer();
  });
  return { answers };
}

/**
 * Hydrate form values from the API assessment payload.
 * @param {{ answers?: Array<object>, schema?: object }} assessment
 */
export function mapAssessmentToFormValues(assessment) {
  const base = getDefaultFormValues(assessment?.schema);
  const rows = assessment?.answers ?? [];
  const questions = flattenQuestions(assessment?.schema);

  rows.forEach((row) => {
    const question = questions.find((q) => q.key === row.questionKey);
    if (!question) return;

    let value = '';
    if (RATING_TYPES.includes(question.type)) {
      value = row.valueRating ?? '';
    } else if (NUMBER_TYPES.includes(question.type)) {
      value = row.valueNumber != null ? String(row.valueNumber) : '';
    } else {
      value = row.valueText ?? row.valueRating ?? '';
    }

    base.answers[question.key] = {
      value,
      comment: row.comment ?? '',
    };
  });

  return base;
}

/**
 * Convert form values into the API `answers` array for a set of questions.
 * @param {object} values RHF values
 * @param {Array<object>} questions question definitions to serialize
 */
export function mapFormValuesToAnswers(values, questions) {
  const answers = values?.answers ?? {};

  return questions.map((question) => {
    const entry = answers[question.key] ?? {};
    const rawValue = entry.value;
    const comment = entry.comment ? String(entry.comment) : undefined;
    const type = normalizeQuestionType(question.type);

    const payload = {
      questionKey: question.key,
      section: question.section,
      answerType: type,
      comment,
    };

    if (RATING_TYPES.includes(type)) {
      payload.valueRating = rawValue || undefined;
    } else if (NUMBER_TYPES.includes(type)) {
      const num = rawValue === '' || rawValue == null ? undefined : Number(rawValue);
      payload.valueNumber = Number.isFinite(num) ? num : undefined;
    } else if (TEXT_TYPES.includes(type)) {
      payload.valueText = rawValue ? String(rawValue) : undefined;
    } else {
      payload.valueText = rawValue ? String(rawValue) : undefined;
    }

    return payload;
  });
}

/** Questions owned by a given fill role from a snapshot schema. */
export function questionsForRole(schema, role) {
  const normalized = normalizeSectionRoleCode(role);
  return flattenQuestions(schema).filter((q) => {
    const fillRole = normalizeSectionRoleCode(q.fillRole);
    return fillRole === normalized;
  });
}

/** Lookup a question by key within a snapshot schema. */
export function getQuestionByKey(schema, key) {
  return flattenQuestions(schema).find((q) => q.key === key);
}

const REQUIRED_EMPLOYEE_TYPES = [
  QUESTION_TYPES.NARRATIVE,
  QUESTION_TYPES.TEXTAREA,
  QUESTION_TYPES.TEXT,
  QUESTION_TYPES.RATING,
  QUESTION_TYPES.RADIO,
  QUESTION_TYPES.SELECT,
];

/** Employee-owned required keys for submission validation. */
export function requiredQuestionKeys(schema) {
  return flattenQuestions(schema)
    .filter(
      (q) =>
        normalizeSectionRoleCode(q.fillRole) === 'EMPLOYEE' &&
        q.required !== false &&
        REQUIRED_EMPLOYEE_TYPES.includes(q.type),
    )
    .map((q) => q.key);
}

/** Scored rating question keys from a snapshot schema. */
export function scoredQuestionKeys(schema) {
  if (!schema?.sections?.length) return [];
  const keys = [];
  for (const section of schema.sections) {
    if (!section.scored) continue;
    for (const question of section.questions ?? []) {
      const type = normalizeQuestionType(question.type);
      if (type === QUESTION_TYPES.RATING && question.isActive !== false) {
        keys.push(question.key);
      }
    }
  }
  return keys;
}

/** Build a weight map from snapshot rating options. */
export function ratingWeightMap(schema) {
  const map = {};
  (schema?.ratingOptions ?? []).forEach((option) => {
    map[String(option.label).toUpperCase()] = option.weight;
  });
  return map;
}

/** Max weight from snapshot rating options (fallback 5). */
export function maxRatingWeight(schema) {
  const weights = (schema?.ratingOptions ?? []).map((o) => o.weight);
  return weights.length ? Math.max(...weights) : 5;
}
