import { z } from 'zod';
import { MAX_SKILL_EXPERIENCE_MONTHS, SKILL_PROFICIENCY } from '../constants/skillEnums';

export const employeeSkillSchema = z.object({
  categoryId: z.string().uuid('Select a category'),
  subcategoryId: z.string().uuid('Select a subcategory'),
  skillId: z.string().uuid('Select a skill'),
  experienceMonths: z.coerce
    .number()
    .int('Use a whole number of months')
    .min(0, 'Experience cannot be negative')
    .max(MAX_SKILL_EXPERIENCE_MONTHS, 'Experience cannot exceed 720 months'),
  proficiency: z.enum([
    SKILL_PROFICIENCY.BEGINNER,
    SKILL_PROFICIENCY.GOOD,
    SKILL_PROFICIENCY.EXPERT,
  ]),
});

export const employeeSkillEditSchema = employeeSkillSchema.pick({
  experienceMonths: true,
  proficiency: true,
});

/** Skill IDs that appear on more than one row (empty ids ignored). */
export function duplicateSkillIds(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (!row?.skillId) continue;
    counts.set(row.skillId, (counts.get(row.skillId) || 0) + 1);
  }
  return new Set(
    [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id),
  );
}
