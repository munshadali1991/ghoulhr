import { z } from 'zod';

export const skillNameFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  isActive: z.boolean(),
});

export const subcategoryFormSchema = skillNameFormSchema.extend({
  categoryId: z.string().uuid('Select a category'),
});

export const skillFormSchema = skillNameFormSchema.extend({
  categoryId: z.string().uuid('Select a category'),
  subcategoryId: z.string().uuid('Select a subcategory'),
});
