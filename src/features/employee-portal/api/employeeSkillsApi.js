import { apiFetch } from '@/shared/api/httpClient';

export function getSkillCatalog() {
  return apiFetch('/ess/skills/catalog');
}

export function listMySkills() {
  return apiFetch('/ess/skills');
}

export function addMySkill(payload) {
  return apiFetch('/ess/skills', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMySkill(id, payload) {
  return apiFetch(`/ess/skills/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeMySkill(id) {
  return apiFetch(`/ess/skills/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
