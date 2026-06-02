import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveApplySchema } from '../schemas/leaveApplySchema';

const defaultValues = {
  leaveType: '',
  fromDate: '',
  fromSession: 'Session 1',
  toDate: '',
  toSession: 'Session 2',
  applyingTo: '',
  ccEmployeeIds: [],
  contactDetails: '',
  reason: '',
};

export function useLeaveApplyForm() {
  return useForm({
    defaultValues,
    resolver: zodResolver(leaveApplySchema),
    mode: 'onBlur',
  });
}
