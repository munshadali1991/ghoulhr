export const QUESTION_TYPES = ['text', 'textarea', 'radio', 'select', 'rating', 'number'];

export const QUESTION_TYPE_LABELS = {
  text: 'Text box',
  textarea: 'Long text',
  radio: 'Radio buttons',
  select: 'Dropdown',
  rating: 'Rating scale',
  number: 'Number',
};

export function createEmptyQuestion(sectionKey, index = 0) {
  return {
    id: crypto.randomUUID(),
    key: `${sectionKey}_q${Date.now()}_${index}`,
    label: '',
    type: 'text',
    options: [],
    allowComment: false,
    required: true,
    helperText: '',
    placeholder: '',
    isActive: true,
  };
}

export function createEmptySection(index = 0, overrides = {}) {
  const key = overrides.key ?? `section_${Date.now()}_${index}`;
  return {
    id: crypto.randomUUID(),
    key,
    title: '',
    banner: '',
    role: 'EMPLOYEE',
    scored: false,
    isActive: true,
    questions: [],
    ...overrides,
  };
}

/** Slugify a section title into a stable section key, avoiding collisions. */
export function slugifySectionKey(title, existingKeys = []) {
  const used = new Set(existingKeys.filter(Boolean));
  let base = String(title ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!base) base = `section_${Date.now()}`;
  let key = base;
  let suffix = 1;
  while (used.has(key)) {
    key = `${base}_${suffix}`;
    suffix += 1;
  }
  return key;
}

/** Build a section from the quick-create modal (title + role only). */
export function createSectionFromQuickCreate({ title, role }, existingSections = []) {
  const existingKeys = existingSections.map((s) => s.key);
  const trimmedTitle = String(title ?? '').trim();
  return createEmptySection(existingSections.length, {
    title: trimmedTitle,
    role: role || 'EMPLOYEE',
    key: slugifySectionKey(trimmedTitle, existingKeys),
    banner: '',
    scored: false,
    isActive: true,
    questions: [],
  });
}

export function createEmptyRatingOption() {
  return {
    id: crypto.randomUUID(),
    label: '',
    weight: 1,
    isActive: true,
  };
}

/** Map API master payload into RHF form values. */
export function masterToFormValues(master) {
  if (!master) {
    return {
      ratingOptions: [],
      sections: [],
    };
  }

  return {
    ratingOptions: (master.ratingOptions ?? []).map((option) => ({
      id: option.id ?? crypto.randomUUID(),
      label: option.label ?? '',
      weight: option.weight ?? 1,
      isActive: option.isActive !== false,
    })),
    sections: (master.sections ?? []).map((section, sectionIndex) => ({
      id: section.id ?? crypto.randomUUID(),
      key: section.key ?? `section_${sectionIndex}`,
      title: section.title ?? '',
      banner: section.banner ?? '',
      role: section.role === 'HR' ? 'HR_ADMIN' : (section.role ?? 'EMPLOYEE'),
      scored: Boolean(section.scored),
      isActive: section.isActive !== false,
      questions: (section.questions ?? []).map((question, questionIndex) => ({
        id: question.id ?? crypto.randomUUID(),
        key: question.key ?? `q_${sectionIndex}_${questionIndex}`,
        label: question.label ?? '',
        type: question.type === 'narrative' ? 'textarea' : (question.type ?? 'text'),
        options: Array.isArray(question.options) ? question.options : [],
        allowComment: Boolean(question.allowComment),
        required: question.required !== false,
        helperText: question.helperText ?? '',
        placeholder: question.placeholder ?? '',
        isActive: question.isActive !== false,
      })),
    })),
  };
}

/** Convert RHF form values into PUT payload (array order defines sort on the server). */
export function formValuesToMasterPayload(values) {
  return {
    ratingOptions: (values.ratingOptions ?? []).map((option) => ({
      id: option.id,
      label: String(option.label ?? '').trim(),
      weight: Number(option.weight ?? 0),
      isActive: option.isActive !== false,
    })),
    sections: (values.sections ?? []).map((section) => ({
      id: section.id,
      key: String(section.key ?? '').trim(),
      title: String(section.title ?? '').trim(),
      banner: section.banner ? String(section.banner).trim() : null,
      role: section.role,
      scored: Boolean(section.scored),
      isActive: section.isActive !== false,
      questions: (section.questions ?? []).map((question) => ({
        id: question.id,
        key: String(question.key ?? '').trim(),
        label: String(question.label ?? '').trim(),
        type: question.type === 'narrative' ? 'textarea' : question.type,
        options:
          (question.type === 'select' || question.type === 'radio') &&
          Array.isArray(question.options)
            ? question.options.filter(Boolean)
            : undefined,
        allowComment: Boolean(question.allowComment),
        required: question.required !== false,
        helperText: question.helperText ? String(question.helperText).trim() : undefined,
        placeholder: question.placeholder ? String(question.placeholder).trim() : undefined,
        isActive: question.isActive !== false,
      })),
    })),
  };
}

function hasRatingQuestions(sections) {
  return (sections ?? []).some((section) =>
    (section.questions ?? []).some(
      (q) => q.isActive !== false && q.type === 'rating',
    ),
  );
}

export function validatePerformanceMasterForm(values, validRoleCodes = null) {
  const issues = [];

  if (!values.sections?.length) {
    issues.push('Add at least one section.');
  }

  if (hasRatingQuestions(values.sections)) {
    if (!values.ratingOptions?.length) {
      issues.push('Add at least one rating option when using rating questions.');
    } else {
      values.ratingOptions.forEach((option, index) => {
        if (!String(option.label ?? '').trim()) {
          issues.push(`Rating option ${index + 1} needs a label.`);
        }
      });
    }
  }

  (values.sections ?? []).forEach((section, sectionIndex) => {
    if (!String(section.key ?? '').trim()) {
      issues.push(`Section ${sectionIndex + 1} needs a key.`);
    }
    if (!String(section.title ?? '').trim()) {
      issues.push(`Section ${sectionIndex + 1} needs a title.`);
    }
    if (!String(section.role ?? '').trim()) {
      issues.push(`Section ${sectionIndex + 1} needs a Filled by role.`);
    } else if (validRoleCodes && !validRoleCodes.has(section.role)) {
      issues.push(`Section ${sectionIndex + 1} has an invalid role.`);
    }
    (section.questions ?? []).forEach((question, questionIndex) => {
      if (!String(question.key ?? '').trim()) {
        issues.push(`Section ${sectionIndex + 1}, question ${questionIndex + 1} needs a key.`);
      }
      if (!String(question.label ?? '').trim()) {
        issues.push(`Section ${sectionIndex + 1}, question ${questionIndex + 1} needs a label.`);
      }
      const type = question.type === 'narrative' ? 'textarea' : question.type;
      if (!QUESTION_TYPES.includes(type)) {
        issues.push(`Section ${sectionIndex + 1}, question ${questionIndex + 1} has an invalid type.`);
      }
      if (
        (type === 'select' || type === 'radio') &&
        !(question.options ?? []).filter(Boolean).length
      ) {
        issues.push(
          `Section ${sectionIndex + 1}, question ${questionIndex + 1} needs at least one option.`,
        );
      }
    });
  });

  return issues;
}

export function optionsStringFromArray(options) {
  return (options ?? []).filter(Boolean).join(', ');
}

export function optionsArrayFromString(value) {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
