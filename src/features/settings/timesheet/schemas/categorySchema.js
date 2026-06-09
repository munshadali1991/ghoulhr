import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  isActive: z.boolean(),
});
