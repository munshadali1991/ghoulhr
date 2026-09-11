import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { regularizationApplySchema } from '../schemas/regularizationApplySchema';

const defaultValues = {
  workDate: '',
  inTime: '',
  outTime: '',
  reason: '',
};

export function useRegularizationApplyForm(initialDate) {
  return useForm({
    defaultValues: {
      ...defaultValues,
      workDate: initialDate || '',
    },
    resolver: zodResolver(regularizationApplySchema),
    mode: 'onBlur',
  });
}
