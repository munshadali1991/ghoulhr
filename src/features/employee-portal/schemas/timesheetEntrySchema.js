import { z } from 'zod';

const workTypeEnum = z.enum([
  'DEVELOPMENT',
  'BUG_FIX',
  'TESTING',
  'MEETING',
  'RESEARCH',
  'DOCUMENTATION',
  'DEPLOYMENT',
  'SUPPORT',
]);

const taskStatusEnum = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
  'ON_HOLD',
]);

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const timesheetEntrySchema = z.object({
  id: z.string().optional(),
  projectName: z.string().min(1, 'Project is required').max(120),
  taskName: z.string().min(1, 'Task name is required').max(200),
  taskDescription: z.string().min(1, 'Description is required').max(2000),
  workType: workTypeEnum,
  hoursSpent: z.coerce.number().min(0.25, 'Minimum 0.25 hours').max(24),
  taskStatus: taskStatusEnum,
  priority: priorityEnum,
  blockerNotes: z.string().max(1000).optional().or(z.literal('')),
});

export const timesheetDayPayloadSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED']),
  entries: z.array(timesheetEntrySchema),
});
