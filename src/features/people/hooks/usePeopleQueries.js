import { useQuery } from '@tanstack/react-query';
import * as api from '../api/peopleApi';

export const peopleKeys = {
  all: ['people'],
  list: (params) => [...peopleKeys.all, 'list', params],
  detail: (id) => [...peopleKeys.all, 'detail', id],
  filterOptions: () => [...peopleKeys.all, 'filter-options'],
};

/**
 * @param {{
 *   view: 'everyone' | 'team',
 *   page: number,
 *   limit: number,
 *   search?: string,
 *   departmentId?: string,
 *   designationId?: string,
 *   status?: string,
 *   includeAllStatuses?: boolean,
 * }} params
 * @param {boolean} [enabled=true]
 */
export function usePeopleList(params, enabled = true) {
  return useQuery({
    queryKey: peopleKeys.list(params),
    queryFn: () => api.listPeople(params),
    enabled: Boolean(params?.view) && enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * @param {string | undefined | null} employeeId
 * @param {boolean} [enabled=true]
 */
export function usePersonDetail(employeeId, enabled = true) {
  return useQuery({
    queryKey: peopleKeys.detail(employeeId),
    queryFn: () => api.getPersonById(employeeId),
    enabled: Boolean(employeeId) && enabled,
  });
}

/**
 * @param {boolean} [enabled=true]
 */
export function usePeopleFilterOptions(enabled = true) {
  return useQuery({
    queryKey: peopleKeys.filterOptions(),
    queryFn: api.getPeopleFilterOptions,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
