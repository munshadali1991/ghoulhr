import { z } from 'zod';
import { grossShiftSpanMinutes, parseTimeToMinutes } from './utils/shifts';

const timePattern = /^\d{1,2}:\d{2}$/;

export const shiftFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Shift name is required').max(191),
    start_time: z.string().trim().regex(timePattern, 'Valid start time is required'),
    end_time: z.string().trim().regex(timePattern, 'Valid end time is required'),
    break_minutes: z.coerce.number().min(0, 'Break must be 0 or more'),
    locationId: z.string().trim().min(1, 'Select a branch / location'),
  })
  .superRefine((data, ctx) => {
    const startMin = parseTimeToMinutes(data.start_time);
    const endMin = parseTimeToMinutes(data.end_time);
    if (startMin == null || endMin == null) return;
    if (startMin === endMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be different from start time',
        path: ['end_time'],
      });
      return;
    }
    const span = grossShiftSpanMinutes(data.start_time, data.end_time);
    const br = Number(data.break_minutes);
    if (span != null && Number.isFinite(br) && br > span) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Break cannot be longer than the shift duration',
        path: ['break_minutes'],
      });
    }
  });

export const scheduleFormSchema = z.object({
  working_days: z.array(z.string()).min(1, 'Select at least one working day'),
  grace_period_minutes: z.coerce.number().min(0),
  half_day_threshold_minutes: z.coerce.number().min(0),
  overtime_enabled: z.boolean(),
  overtime_rules: z.object({
    max_hours_per_day: z.coerce.number().optional(),
    multiplier: z.coerce.number().optional(),
  }),
});

export const checkInFormSchema = z.object({
  tracking_mode: z.enum(['manual', 'biometric', 'geo', 'ip']),
  geo_fencing_enabled: z.boolean(),
  allowed_ip_addresses: z.array(z.string()),
});
