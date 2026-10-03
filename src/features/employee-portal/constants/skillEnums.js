export const SKILL_PROFICIENCY = {
  BEGINNER: 'BEGINNER',
  GOOD: 'GOOD',
  EXPERT: 'EXPERT',
};

export const SKILL_PROFICIENCY_OPTIONS = [
  { value: SKILL_PROFICIENCY.BEGINNER, label: 'Beginner' },
  { value: SKILL_PROFICIENCY.GOOD, label: 'Good' },
  { value: SKILL_PROFICIENCY.EXPERT, label: 'Expert' },
];

export const MAX_SKILL_EXPERIENCE_MONTHS = 720;

export function proficiencyLabel(value) {
  return SKILL_PROFICIENCY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
