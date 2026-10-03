import { describe, expect, it } from 'vitest';
import {
  duplicateSkillIds,
  employeeSkillEditSchema,
  employeeSkillSchema,
} from './employeeSkillSchema';

const valid = {
  categoryId: '11111111-1111-4111-8111-111111111111',
  subcategoryId: '22222222-2222-4222-8222-222222222222',
  skillId: '33333333-3333-4333-8333-333333333333',
  experienceMonths: 24,
  proficiency: 'GOOD',
};

describe('employeeSkillSchema', () => {
  it('accepts a valid assignment', () => {
    const result = employeeSkillSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects negative experience months', () => {
    const result = employeeSkillSchema.safeParse({ ...valid, experienceMonths: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects experience above 720 months', () => {
    const result = employeeSkillSchema.safeParse({ ...valid, experienceMonths: 721 });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown proficiency value', () => {
    const result = employeeSkillSchema.safeParse({ ...valid, proficiency: 'INTERMEDIATE' });
    expect(result.success).toBe(false);
  });

  it('requires a skill id when adding', () => {
    const result = employeeSkillSchema.safeParse({
      ...valid,
      skillId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('employeeSkillEditSchema', () => {
  it('allows updating months and proficiency only', () => {
    const result = employeeSkillEditSchema.safeParse({
      experienceMonths: 36,
      proficiency: 'EXPERT',
    });
    expect(result.success).toBe(true);
  });
});

describe('duplicateSkillIds', () => {
  it('returns ids that appear more than once', () => {
    const result = duplicateSkillIds([
      { skillId: valid.skillId },
      { skillId: valid.skillId },
      { skillId: '44444444-4444-4444-8444-444444444444' },
    ]);
    expect([...result]).toEqual([valid.skillId]);
  });

  it('ignores empty skill ids', () => {
    const result = duplicateSkillIds([{ skillId: '' }, { skillId: '' }, {}]);
    expect(result.size).toBe(0);
  });
});
