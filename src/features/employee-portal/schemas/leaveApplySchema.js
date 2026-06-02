import { z } from 'zod';

export const leaveApplySchema = z
  .object({
    leaveType: z.string().min(1, 'Select a leave type'),
    fromDate: z.string().min(1, 'From date is required'),
    fromSession: z.string().min(1),
    toDate: z.string().min(1, 'To date is required'),
    toSession: z.string().min(1),
    applyingTo: z.string().min(1, 'Select an approver'),
    ccEmployeeIds: z.array(z.string()).default([]),
    contactDetails: z.string().optional(),
    reason: z.string().min(1, 'Reason is required'),
  })
  .refine(
    (data) => !data.fromDate || !data.toDate || data.toDate >= data.fromDate,
    { message: 'To date must be on or after from date', path: ['toDate'] },
  );
