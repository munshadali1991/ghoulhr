import { useQuery } from '@tanstack/react-query';
import { fetchHrDashboard } from '../api/hrDashboardApi';

export const hrDashboardKeys = {
  all: ['hr-dashboard'],
};

export function useHrDashboard() {
  return useQuery({
    queryKey: hrDashboardKeys.all,
    queryFn: fetchHrDashboard,
  });
}
