import { apiFetch } from '@/shared/api/httpClient';

function withQuery(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function getHrSkillCatalog() {
  return apiFetch('/hr/skills/catalog');
}

export function searchHrSkillEmployees(filters = {}) {
  return apiFetch(
    withQuery('/hr/skills/employees', {
      q: filters.q,
      categoryId: filters.categoryId,
      subcategoryId: filters.subcategoryId,
      skillId: filters.skillId,
      proficiency: filters.proficiency,
      minExperienceMonths: filters.minExperienceMonths,
    }),
  );
}

export function getHrSkillEmployeeProfile(employeeId) {
  return apiFetch(`/hr/skills/employees/${encodeURIComponent(employeeId)}`);
}
