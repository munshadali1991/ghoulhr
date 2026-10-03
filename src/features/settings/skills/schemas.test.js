import { describe, expect, it } from 'vitest';
import { skillFormSchema, skillNameFormSchema, subcategoryFormSchema } from './schemas';

describe('skill master schemas', () => {
  it('requires a trimmed category name', () => {
    expect(skillNameFormSchema.safeParse({ name: '   ', isActive: true }).success).toBe(false);
    expect(skillNameFormSchema.safeParse({ name: 'Frontend', isActive: true }).success).toBe(true);
  });

  it('requires a category when creating a subcategory', () => {
    const result = subcategoryFormSchema.safeParse({
      name: 'Backend',
      isActive: true,
      categoryId: '',
    });
    expect(result.success).toBe(false);
  });

  it('requires category and subcategory for a skill', () => {
    const result = skillFormSchema.safeParse({
      name: 'React',
      isActive: true,
      categoryId: '11111111-1111-4111-8111-111111111111',
      subcategoryId: '22222222-2222-4222-8222-222222222222',
    });
    expect(result.success).toBe(true);
  });
});
