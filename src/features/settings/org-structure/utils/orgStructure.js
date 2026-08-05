import { formatDisplayDate, pickRecordTimestamp } from '@/shared/utils/timestamps';
import { generateUuid, isUuid } from '@/shared/utils/uuid';

export { generateUuid, isUuid };

export function sanitizeMasterData(rawDepartments, rawDesignations) {
  const departmentsInput = Array.isArray(rawDepartments) ? rawDepartments : [];
  const designationsInput = Array.isArray(rawDesignations) ? rawDesignations : [];

  const idMap = new Map();
  const departments = departmentsInput.map((department) => {
    const originalId = typeof department?.id === 'string' ? department.id : '';
    const nextId = isUuid(originalId) ? originalId : generateUuid();
    if (originalId) {
      idMap.set(originalId, nextId);
    }
    return {
      id: nextId,
      name: typeof department?.name === 'string' ? department.name : '',
      code: typeof department?.code === 'string' ? department.code : '',
      isActive: department?.isActive !== false,
      createdAt: pickRecordTimestamp(department),
    };
  });

  const activeDepartmentIds = new Set(departments.map((department) => department.id));
  const designations = designationsInput.map((designation) => {
    const originalId = typeof designation?.id === 'string' ? designation.id : '';
    const nextId = isUuid(originalId) ? originalId : generateUuid();
    const rawIds = Array.isArray(designation?.departmentIds) ? designation.departmentIds : [];
    const mappedIds = rawIds
      .map((id) => (typeof id === 'string' ? id : ''))
      .map((id) => idMap.get(id) || id)
      .filter((id) => isUuid(id) && activeDepartmentIds.has(id));
    return {
      id: nextId,
      name: typeof designation?.name === 'string' ? designation.name : '',
      departmentIds: [...new Set(mappedIds)],
      isActive: designation?.isActive !== false,
      createdAt: pickRecordTimestamp(designation),
    };
  });

  return { departments, designations };
}

/** Fields accepted by POST /settings/employee for department rows. */
export function toApiDepartment(department) {
  return {
    id: department.id,
    name: department.name,
    code: department.code?.trim() || '',
    isActive: department.isActive !== false,
  };
}

/** Fields accepted by POST /settings/employee for designation rows. */
export function toApiDesignation(designation) {
  return {
    id: designation.id,
    name: designation.name,
    departmentIds: designation.departmentIds || [],
    isActive: designation.isActive !== false,
  };
}

export function validateDepartments(departments) {
  const names = new Set();
  for (const department of departments) {
    const name = department?.name?.trim();
    if (!name) {
      return 'Every department must have a name.';
    }
    const key = name.toLowerCase();
    if (names.has(key)) {
      return 'Department names must be unique.';
    }
    names.add(key);
  }
  return null;
}

export function validateDesignations(designations) {
  const names = new Set();
  for (const designation of designations) {
    const name = designation?.name?.trim();
    if (!name) {
      return 'Every designation must have a name.';
    }
    const key = name.toLowerCase();
    if (names.has(key)) {
      return 'Designation names must be unique.';
    }
    names.add(key);

    const ids = Array.isArray(designation?.departmentIds) ? designation.departmentIds : [];
    if (ids.length === 0) {
      return 'Each designation must be linked to at least one department.';
    }
  }
  return null;
}

export function removeDepartmentCascade(departments, designations, departmentId) {
  const nextDepartments = departments.filter((d) => d.id !== departmentId);
  const nextDesignations = [];

  for (const designation of designations) {
    const nextIds = (designation.departmentIds || []).filter((id) => id !== departmentId);
    if (nextIds.length === 0) {
      continue;
    }
    nextDesignations.push({ ...designation, departmentIds: nextIds });
  }

  return { departments: nextDepartments, designations: nextDesignations };
}

export function formatOrgDate(value) {
  return formatDisplayDate(value);
}

export function departmentNameMap(departments) {
  return new Map(departments.map((d) => [d.id, d.name?.trim() || 'Department']));
}
