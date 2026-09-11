/**
 * @typedef {Object} SkillSearchFilters
 * @property {string} q
 * @property {string} categoryId
 * @property {string} subcategoryId
 * @property {string} skillId
 * @property {string} proficiency
 * @property {string|number} minExperienceMonths
 */

/**
 * @typedef {Object} SkillBadge
 * @property {string} skillId
 * @property {string|null} skillName
 * @property {string} proficiency
 * @property {number} experienceMonths
 */

/**
 * @typedef {Object} SkillSearchEmployeeCard
 * @property {string} id
 * @property {string} employeeCode
 * @property {string} name
 * @property {string|null} profilePhotoPreviewUrl
 * @property {string|null} designationName
 * @property {string|null} departmentName
 * @property {SkillBadge[]} topSkills
 */

/**
 * @typedef {Object} SkillSearchProfileSkill
 * @property {string} skillId
 * @property {string} skillName
 * @property {number} experienceMonths
 * @property {string} proficiency
 */

/**
 * @typedef {Object} SkillSearchSubcategoryGroup
 * @property {string} subcategoryId
 * @property {string} subcategoryName
 * @property {SkillSearchProfileSkill[]} skills
 */

/**
 * @typedef {Object} SkillSearchCategoryGroup
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {SkillSearchSubcategoryGroup[]} subcategories
 */

/**
 * @typedef {Object} SkillSearchProfile
 * @property {string} id
 * @property {string} employeeCode
 * @property {string} name
 * @property {string|null} profilePhotoPreviewUrl
 * @property {string|null} designationName
 * @property {string|null} departmentName
 * @property {string|null} managerName
 * @property {string|null} totalExperienceYears
 * @property {string|null} lastProfileUpdate
 * @property {{ total: number, expert: number, good: number, beginner: number }} counts
 * @property {SkillSearchCategoryGroup[]} groups
 */

export {};
