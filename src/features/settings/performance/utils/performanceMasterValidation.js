import { QUESTION_TYPES, validatePerformanceMasterForm } from './performanceMasterMappers';

function normalizeType(type) {
  return type === 'narrative' ? 'textarea' : type;
}

function hasActiveRatingOptions(ratingOptions) {
  return (ratingOptions ?? []).some(
    (o) => o?.isActive !== false && String(o?.label ?? '').trim(),
  );
}

function hasRatingQuestions(sections) {
  return (sections ?? []).some((section) =>
    (section.questions ?? []).some(
      (q) => q?.isActive !== false && normalizeType(q.type) === 'rating',
    ),
  );
}

function isQuestionValid(question, ratingOptions) {
  const type = normalizeType(question?.type);
  if (!String(question?.label ?? '').trim()) return false;
  if (!String(question?.key ?? '').trim()) return false;
  if (!QUESTION_TYPES.includes(type)) return false;
  if (
    (type === 'select' || type === 'radio') &&
    !(question.options ?? []).filter(Boolean).length
  ) {
    return false;
  }
  if (type === 'rating' && !hasActiveRatingOptions(ratingOptions)) return false;
  return true;
}

function getSectionIssues(section, sectionIndex, ratingOptions, validRoleCodes) {
  const issues = [];
  const label = section.title?.trim() || `Section ${sectionIndex + 1}`;

  if (!String(section.key ?? '').trim()) {
    issues.push(`${label}: section key is required`);
  }
  if (!String(section.title ?? '').trim()) {
    issues.push(`${label}: title is required`);
  }
  if (!String(section.role ?? '').trim()) {
    issues.push(`${label}: Filled by role is required`);
  } else if (validRoleCodes && !validRoleCodes.has(section.role)) {
    issues.push(`${label}: invalid Filled by role`);
  }

  const activeQuestions = (section.questions ?? []).filter((q) => q?.isActive !== false);
  if (!activeQuestions.length) {
    issues.push(`${label}: add at least one question`);
  }

  activeQuestions.forEach((question, questionIndex) => {
    const qLabel = question.label?.trim() || `Question ${questionIndex + 1}`;
    const type = normalizeType(question.type);

    if (!String(question.key ?? '').trim()) {
      issues.push(`${label} · ${qLabel}: question key is required`);
    }
    if (!String(question.label ?? '').trim()) {
      issues.push(`${label} · ${qLabel}: label is required`);
    }
    if (!QUESTION_TYPES.includes(type)) {
      issues.push(`${label} · ${qLabel}: invalid question type`);
    }
    if (
      (type === 'select' || type === 'radio') &&
      !(question.options ?? []).filter(Boolean).length
    ) {
      issues.push(`${label} · ${qLabel}: add at least one option`);
    }
    if (type === 'rating' && !hasActiveRatingOptions(ratingOptions)) {
      issues.push(`${label} · ${qLabel}: rating scale is not defined`);
    }
  });

  return issues;
}

/**
 * Per-section completeness for rail status dots.
 * @returns {Array<{ index: number, complete: boolean, issues: string[] }>}
 */
export function analyzeSectionStatuses(values, validRoleCodes = null) {
  const sections = values?.sections ?? [];
  const ratingOptions = values?.ratingOptions ?? [];

  return sections.map((section, index) => {
    const issues = getSectionIssues(section, index, ratingOptions, validRoleCodes);
    const hasRole = Boolean(String(section.role ?? '').trim());
    const activeQuestions = (section.questions ?? []).filter((q) => q?.isActive !== false);
    const hasValidQuestion =
      activeQuestions.length > 0 &&
      activeQuestions.every((q) => isQuestionValid(q, ratingOptions));

    const complete = hasRole && hasValidQuestion && issues.length === 0;

    return { index, complete, issues };
  });
}

/**
 * Field-level errors keyed by RHF path (e.g. sections.0.title).
 */
export function buildFieldErrors(values, validRoleCodes = null) {
  const errors = {};
  const sections = values?.sections ?? [];
  const ratingOptions = values?.ratingOptions ?? [];

  sections.forEach((section, sectionIndex) => {
    const prefix = `sections.${sectionIndex}`;
    if (!String(section.title ?? '').trim()) {
      errors[`${prefix}.title`] = 'Title is required';
    }
    if (!String(section.role ?? '').trim()) {
      errors[`${prefix}.role`] = 'Filled by role is required';
    } else if (validRoleCodes && !validRoleCodes.has(section.role)) {
      errors[`${prefix}.role`] = 'Invalid role';
    }
    if (!String(section.key ?? '').trim()) {
      errors[`${prefix}.key`] = 'Section key is required';
    }

    (section.questions ?? []).forEach((question, questionIndex) => {
      const qPrefix = `${prefix}.questions.${questionIndex}`;
      const type = normalizeType(question.type);

      if (!String(question.label ?? '').trim()) {
        errors[`${qPrefix}.label`] = 'Label is required';
      }
      if (!String(question.key ?? '').trim()) {
        errors[`${qPrefix}.key`] = 'Question key is required';
      }
      if (
        (type === 'select' || type === 'radio') &&
        !(question.options ?? []).filter(Boolean).length
      ) {
        errors[`${qPrefix}.options`] = 'Add at least one option';
      }
      if (type === 'rating' && !hasActiveRatingOptions(ratingOptions)) {
        errors[`${qPrefix}.type`] = 'Rating scale is not defined yet';
      }
    });
  });

  if (hasRatingQuestions(sections) && !hasActiveRatingOptions(ratingOptions)) {
    errors['ratingOptions'] = 'Add at least one rating option';
  }

  return errors;
}

/** Full validation snapshot for save tooltip and hooks. */
export function analyzePerformanceMaster(values, validRoleCodes = null) {
  const issues = validatePerformanceMasterForm(values, validRoleCodes);
  const sectionStatuses = analyzeSectionStatuses(values, validRoleCodes);
  const fieldErrors = buildFieldErrors(values, validRoleCodes);

  return {
    issues,
    sectionStatuses,
    fieldErrors,
    isValid: issues.length === 0,
  };
}
