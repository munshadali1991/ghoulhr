import { z } from 'zod';

export const timesheetSettingsSchema = z.object({
  max_hours_per_day: z.coerce.number().min(1).max(24),
  max_past_days: z.coerce.number().int().min(0).max(30),
  require_submission_by_eod: z.boolean(),
  employee_helper_text: z.string().max(2000).optional().or(z.literal('')),
  week_starts_on: z.coerce.number().int().min(0).max(6),
});
