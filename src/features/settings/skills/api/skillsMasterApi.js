import { apiFetch } from '@/shared/api/httpClient';

function settingsFetch(path, organizationId, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: {
      'x-org-id': organizationId,
      ...(options.headers ?? {}),
    },
  });
}

function withQuery(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function listSkillCategories(organizationId) {
  return settingsFetch('/settings/skills/categories', organizationId);
}

export function createSkillCategory(organizationId, payload) {
  return settingsFetch('/settings/skills/categories', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSkillCategory(organizationId, id, payload) {
  return settingsFetch(`/settings/skills/categories/${id}`, organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteSkillCategory(organizationId, id) {
  return settingsFetch(`/settings/skills/categories/${id}`, organizationId, {
    method: 'DELETE',
  });
}

export function listSkillSubcategories(organizationId, categoryId) {
  return settingsFetch(
    withQuery('/settings/skills/subcategories', { categoryId }),
    organizationId,
  );
}

export function createSkillSubcategory(organizationId, payload) {
  return settingsFetch('/settings/skills/subcategories', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSkillSubcategory(organizationId, id, payload) {
  return settingsFetch(`/settings/skills/subcategories/${id}`, organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteSkillSubcategory(organizationId, id) {
  return settingsFetch(`/settings/skills/subcategories/${id}`, organizationId, {
    method: 'DELETE',
  });
}

export function listSkills(organizationId, { categoryId, subcategoryId } = {}) {
  return settingsFetch(
    withQuery('/settings/skills/items', { categoryId, subcategoryId }),
    organizationId,
  );
}

export function createSkill(organizationId, payload) {
  return settingsFetch('/settings/skills/items', organizationId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSkill(organizationId, id, payload) {
  return settingsFetch(`/settings/skills/${id}`, organizationId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteSkill(organizationId, id) {
  return settingsFetch(`/settings/skills/${id}`, organizationId, {
    method: 'DELETE',
  });
}
