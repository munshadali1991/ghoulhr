import { z } from 'zod';

export const departmentFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  code: z
    .string()
    .trim()
    .max(24, 'Code must be 24 characters or less')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});

export const designationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  departmentIds: z.array(z.string()).min(1, 'Select at least one department'),
  isActive: z.boolean(),
});
