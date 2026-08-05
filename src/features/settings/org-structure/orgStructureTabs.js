import { SETTINGS_ACCESS } from '@/features/auth/config/accessRegistry';

/** @deprecated Use SETTINGS_ACCESS.departments.tabs */
export const ORG_STRUCTURE_TABS = {
  departments: 'departments',
  designations: 'designations',
};

export const ORG_STRUCTURE_TAB_DEFS = SETTINGS_ACCESS.departments.tabs;

export function orgStructureTabKeyFromLegacy(value) {
  if (value === ORG_STRUCTURE_TABS.departments || value === 'departments') {
    return 'departments';
  }
  if (value === ORG_STRUCTURE_TABS.designations || value === 'designations') {
    return 'designations';
  }
  return value;
}
