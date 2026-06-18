/**
 * @typedef {Object} RbacRole
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} [description]
 * @property {boolean} isSystem
 * @property {boolean} isActive
 * @property {number} [permissionCount]
 * @property {number} [assignedEmployeeCount]
 * @property {boolean} [isEditable]
 * @property {boolean} [isDeletable]
 */

/**
 * @typedef {Object} RbacPermission
 * @property {string} id
 * @property {string} code
 * @property {string} moduleCode
 * @property {string} action
 * @property {string} [description]
 * @property {string} [resource]
 * @property {string} [actionLabel]
 * @property {string} [accessScope]
 */

/**
 * @typedef {Object} RbacRoleDetail
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} [description]
 * @property {boolean} isSystem
 * @property {boolean} isActive
 * @property {boolean} isEditable
 * @property {boolean} isDeletable
 * @property {number} permissionCount
 * @property {number} assignedEmployeeCount
 * @property {RbacPermission[]} permissions
 */

/**
 * @typedef {Object} RbacEmployeeAssignment
 * @property {string} id
 * @property {string} employeeId
 * @property {string} roleId
 * @property {boolean} isPrimary
 * @property {RbacRole} [role]
 */

/**
 * @typedef {Object} RbacAuditLog
 * @property {string} id
 * @property {string} action
 * @property {string} [actorEmployeeId]
 * @property {string} [actorName]
 * @property {string} [actorEmployeeCode]
 * @property {string} [targetType]
 * @property {string} [targetId]
 * @property {string} summary
 * @property {Record<string, unknown>} [before]
 * @property {Record<string, unknown>} [after]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} RbacAuditLogPage
 * @property {RbacAuditLog[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

export {};
