import { z } from 'zod';

export const regularizationApplySchema = z
  .object({
    workDate: z.string().min(1, 'Date is required'),
    inTime: z.string().min(1, 'In time is required'),
    outTime: z.string().min(1, 'Out time is required'),
    reason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
  })
  .refine((data) => data.outTime !== data.inTime, {
    message: 'Out time must differ from in time',
    path: ['outTime'],
  });
