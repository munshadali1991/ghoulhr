import { createContext } from 'react';

/**
 * @typedef {object} AuthUser
 * @property {string} id
 * @property {string} organizationId
 * @property {string} organizationSubdomain
 * @property {string} email
 * @property {string} role
 * @property {string} [employeeCode]
 * @property {string} [name]
 * @property {boolean} [mustChangePassword]
 * @property {string} [status]
 */

/**
 * @typedef {object} AuthSession
 * @property {AuthUser} user
 * @property {string[]} entitledModules
 * @property {string[]} permissions
 * @property {string[]} roles
 */

export const AuthContext = createContext(null);
