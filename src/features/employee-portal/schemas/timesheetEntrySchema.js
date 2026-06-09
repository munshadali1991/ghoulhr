import { z } from 'zod';

const taskStatusEnum = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
  'ON_HOLD',
]);

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/** Inline row validation (UI fields only). */
export const timesheetInlineRowSchema = z.object({
  workDate: z.string().min(1, 'Date is required'),
  categoryId: z.string().uuid('Select a category'),
  workAreaDescription: z.string().min(1, 'Work area / description is required').max(2000),
  hoursSpent: z.coerce.number().min(0.25, 'Minimum 0.25 hours').max(24),
  taskStatus: taskStatusEnum,
  priority: priorityEnum,
  refNumber: z.string().max(120).optional().or(z.literal('')),
});

export const timesheetEntrySchema = timesheetInlineRowSchema;
