import { z } from 'zod';
import {
  DOCUMENT_TYPE_OPTIONS,
  EMERGENCY_RELATIONSHIP_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  normalizeGender,
  TAX_REGIME_OPTIONS,
  WORK_MODE_OPTIONS,
} from './constants';

const optStr = z.union([z.string(), z.literal('')]).optional();

export const MAX_JOINING_FUTURE_DAYS = 30;
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

const EMPLOYMENT_TYPE_VALUES = EMPLOYMENT_TYPE_OPTIONS.map((o) => o.value);
const EMPLOYMENT_STATUS_VALUES = EMPLOYMENT_STATUS_OPTIONS.map((o) => o.value);
const WORK_MODE_VALUES = WORK_MODE_OPTIONS.map((o) => o.value);
const TAX_REGIME_VALUES = TAX_REGIME_OPTIONS.map((o) => o.value);
const DOCUMENT_TYPE_VALUES = DOCUMENT_TYPE_OPTIONS.map((o) => o.value);

const ALLOWED_MIME_PREFIXES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// --- Shared validators ---

/** Allowed phone characters: digits, +, spaces, dashes, parentheses, dots */
const PHONE_CHARS_PATTERN = /^[\d+\s\-().]+$/;

export function phoneDigitCount(value) {
  return String(value ?? '').replace(/\D/g, '').length;
}

export function hasInvalidPhoneCharacters(value) {
  const v = String(value ?? '').trim();
  if (!v) return false;
  return !PHONE_CHARS_PATTERN.test(v);
}

export function isValidPhone(value, min = 8, max = 15) {
  const v = String(value ?? '').trim();
  if (!v) return false;
  if (hasInvalidPhoneCharacters(v)) return false;
  const digits = phoneDigitCount(v);
  return digits >= min && digits <= max;
}

export function isValidPan(value) {
  return /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(String(value ?? '').trim());
}

export function isValidAadhaar(value) {
  return /^\d{12}$/.test(String(value ?? '').replace(/\s/g, ''));
}

export function isValidIfsc(value) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(value ?? '').trim().toUpperCase());
}

export function isValidUan(value) {
  return /^\d{12}$/.test(String(value ?? '').replace(/\s/g, ''));
}

/** Person name: letters, spaces, hyphens, apostrophes; min 2 chars */
export function isValidPersonName(value) {
  const v = String(value ?? '').trim();
  if (v.length < 2) return false;
  return /^[a-zA-Z\s\-'.]+$/.test(v) && v.length <= 120;
}

/** Company / designation / job title text */
export function isValidOrgLabel(value) {
  const v = String(value ?? '').trim();
  if (v.length < 2) return false;
  return /^[a-zA-Z0-9\s\-'.,&()/]+$/.test(v) && v.length <= 200;
}

/** @deprecated use isValidPersonName */
export function isValidName(value) {
  return isValidPersonName(value);
}

export function isValidUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isNotFutureDate(dateStr) {
  if (!dateStr?.trim()) return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d <= today;
}

export function isAtLeastAge(dateStr, age) {
  if (!dateStr?.trim()) return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - age);
  return d <= cutoff;
}

export function isWithinFutureDays(dateStr, days) {
  if (!dateStr?.trim()) return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const max = new Date();
  max.setDate(max.getDate() + days);
  max.setHours(23, 59, 59, 999);
  return d <= max;
}

export function parseOptionalNumber(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length === 0) return { valid: true, errors: [] };

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&#)');
  }

  return { valid: errors.length === 0, errors };
}

function trimOrEmpty(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function isExperienceRowFilled(exp) {
  return (
    trimOrEmpty(exp?.previousCompanyName) ||
    trimOrEmpty(exp?.previousDesignation) ||
    trimOrEmpty(exp?.totalExperienceYears?.toString()) ||
    trimOrEmpty(exp?.lastDrawnCtc?.toString()) ||
    trimOrEmpty(exp?.experienceSummary)
  );
}

function isPayrollFieldFilled(payroll) {
  if (!payroll) return false;
  return (
    trimOrEmpty(payroll.ctc) ||
    trimOrEmpty(payroll.salaryStructure) ||
    trimOrEmpty(payroll.basicSalary) ||
    trimOrEmpty(payroll.hra) ||
    trimOrEmpty(payroll.allowancesJson) ||
    (payroll.taxRegime && payroll.taxRegime !== 'NEW')
  );
}

function addAllOrNothingIssues(fields, values, zctx, messages = {}) {
  const any = fields.some((f) => trimOrEmpty(values[f]));
  const all = fields.every((f) => trimOrEmpty(values[f]));
  if (any && !all) {
    fields.forEach((f) => {
      if (trimOrEmpty(values[f])) return;
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [f],
        message: messages[f] || 'This field is required when bank details are provided',
      });
    });
  }
  return any;
}

// --- Step schemas ---

export const basicStepSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(120),
    middleName: optStr,
    lastName: z.string().min(1, 'Last name is required').max(120),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']),
    dateOfBirth: z.string().optional(),
    personalEmail: z.string().min(1, 'Personal email is required').email('Invalid email'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    alternateMobile: optStr,
    profilePhotoUrl: optStr,
    profilePhotoStorageKey: optStr,
    profilePhotoFileName: optStr,
    profilePhotoPreviewUrl: optStr,
  })
  .superRefine((data, zctx) => {
    if (!isValidPersonName(data.firstName)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firstName'],
        message: 'Enter a valid first name (letters only, at least 2 characters)',
      });
    }
    if (!isValidPersonName(data.lastName)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lastName'],
        message: 'Enter a valid last name (letters only, at least 2 characters)',
      });
    }
    const middle = trimOrEmpty(data.middleName);
    if (middle && !isValidPersonName(middle)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['middleName'],
        message: 'Middle name may only contain letters, spaces, hyphens, and apostrophes',
      });
    }
    const email = trimOrEmpty(data.personalEmail);
    if (email.length > 254) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['personalEmail'],
        message: 'Email address is too long',
      });
    }
    const dob = trimOrEmpty(data.dateOfBirth);
    if (dob) {
      if (Number.isNaN(new Date(dob).getTime())) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfBirth'], message: 'Invalid date of birth' });
      } else if (!isNotFutureDate(dob)) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfBirth'], message: 'Date of birth cannot be in the future' });
      } else if (!isAtLeastAge(dob, 18)) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfBirth'], message: 'Employee must be at least 18 years old' });
      }
    }
    if (!isValidPhone(data.mobileNumber)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobileNumber'],
        message: hasInvalidPhoneCharacters(data.mobileNumber)
          ? 'Mobile number must contain digits only (optional +, spaces, or dashes)'
          : 'Enter a valid mobile number (8–15 digits)',
      });
    }
    const alt = trimOrEmpty(data.alternateMobile);
    if (alt && !isValidPhone(alt)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobile'],
        message: hasInvalidPhoneCharacters(alt)
          ? 'Alternate mobile must contain digits only (optional +, spaces, or dashes)'
          : 'Enter a valid alternate mobile number (8–15 digits)',
      });
    }
    const photo = trimOrEmpty(data.profilePhotoUrl);
    if (photo && !isValidUrl(photo)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['profilePhotoUrl'],
        message: 'Enter a valid URL starting with http:// or https://',
      });
    }
  });

export function createEmploymentStepSchema(employmentContext = {}) {
  const { requireShift = false } = employmentContext;

  return z
    .object({
      dateOfJoining: z.string().min(1, 'Date of joining is required'),
      employmentType: z.enum(EMPLOYMENT_TYPE_VALUES).or(z.literal('')).optional(),
      employmentStatus: z.enum(EMPLOYMENT_STATUS_VALUES).or(z.literal('')).optional(),
      officialEmail: z.union([z.string().email('Invalid official email'), z.literal('')]).optional(),
      departmentId: z.string().uuid('Department is required'),
      designationId: z.string().uuid('Designation is required'),
      hrManagerId: optStr,
      workMode: z.enum(WORK_MODE_VALUES).or(z.literal('')).optional(),
      shift: optStr,
      probationPeriodDays: z.union([z.string(), z.number()]).optional(),
      noticePeriodDays: z.union([z.string(), z.number()]).optional(),
      businessUnit: optStr,
    })
    .superRefine((data, zctx) => {
      const doj = trimOrEmpty(data.dateOfJoining);
      if (doj) {
        if (Number.isNaN(new Date(doj).getTime())) {
          zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfJoining'], message: 'Enter a valid date of joining' });
        } else if (!isWithinFutureDays(doj, MAX_JOINING_FUTURE_DAYS)) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dateOfJoining'],
            message: `Date of joining cannot be more than ${MAX_JOINING_FUTURE_DAYS} days in the future`,
          });
        }
      }

      const hrId = trimOrEmpty(data.hrManagerId);
      if (hrId) {
        const uuidResult = z.string().uuid().safeParse(hrId);
        if (!uuidResult.success) {
          zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hrManagerId'], message: 'Select a valid HR manager' });
        }
      }

      const probation = parseOptionalNumber(data.probationPeriodDays);
      if (data.probationPeriodDays !== '' && data.probationPeriodDays != null) {
        if (Number.isNaN(probation) || probation < 0 || probation > 3650 || !Number.isInteger(probation)) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['probationPeriodDays'],
            message: 'Probation must be a whole number between 0 and 3650',
          });
        }
      }

      const notice = parseOptionalNumber(data.noticePeriodDays);
      if (data.noticePeriodDays !== '' && data.noticePeriodDays != null) {
        if (Number.isNaN(notice) || notice < 0 || notice > 730 || !Number.isInteger(notice)) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['noticePeriodDays'],
            message: 'Notice period must be a whole number between 0 and 730',
          });
        }
      }

      if (requireShift && !trimOrEmpty(data.shift)) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['shift'], message: 'Select a shift for this location' });
      }
    });
}

export const employmentStepSchema = createEmploymentStepSchema();

export const experienceEntrySchema = z
  .object({
    previousCompanyName: optStr,
    previousDesignation: optStr,
    totalExperienceYears: optStr,
    lastDrawnCtc: optStr,
    experienceSummary: optStr,
  })
  .superRefine((row, zctx) => {
    if (!isExperienceRowFilled(row)) return;

    if (!trimOrEmpty(row.previousCompanyName)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['previousCompanyName'],
        message: 'Previous company name is required when adding experience',
      });
    } else if (!isValidOrgLabel(row.previousCompanyName)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['previousCompanyName'],
        message: 'Enter a valid company name (letters, numbers, and common punctuation only)',
      });
    }
    if (!trimOrEmpty(row.previousDesignation)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['previousDesignation'],
        message: 'Previous designation is required when adding experience',
      });
    } else if (!isValidOrgLabel(row.previousDesignation)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['previousDesignation'],
        message: 'Enter a valid designation (letters, numbers, and common punctuation only)',
      });
    }

    const years = trimOrEmpty(row.totalExperienceYears?.toString());
    if (years) {
      if (!/^\d+(\.\d{1,2})?$/.test(years)) {
        zctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['totalExperienceYears'],
          message: 'Experience years must be a valid number',
        });
      } else {
        const n = parseOptionalNumber(years);
        if (Number.isNaN(n) || n < 0 || n > 80) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['totalExperienceYears'],
            message: 'Experience years must be between 0 and 80',
          });
        }
      }
    }

    const ctc = trimOrEmpty(row.lastDrawnCtc?.toString());
    if (ctc) {
      if (!/^\d+(\.\d{1,2})?$/.test(ctc)) {
        zctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lastDrawnCtc'],
          message: 'Last drawn CTC must be a valid number',
        });
      } else {
        const n = parseOptionalNumber(ctc);
        if (Number.isNaN(n) || n < 0) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lastDrawnCtc'],
            message: 'Last drawn CTC must be zero or greater',
          });
        }
      }
    }

    const summary = trimOrEmpty(row.experienceSummary);
    if (summary.length > 2000) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['experienceSummary'],
        message: 'Experience summary must be 2000 characters or fewer',
      });
    }
  });

export const experienceStepSchema = z.object({
  experiences: z.array(experienceEntrySchema),
});

export function createPayrollStepSchema(options = {}) {
  const requireCtc = options.requireSalary === true;

  return z
    .object({
      ctc: optStr,
      salaryStructure: optStr,
      basicSalary: optStr,
      hra: optStr,
      allowancesJson: optStr,
      pfApplicable: z.boolean().optional(),
      esicApplicable: z.boolean().optional(),
      taxRegime: z.enum(TAX_REGIME_VALUES).or(z.literal('')).optional(),
    })
    .superRefine((data, zctx) => {
      if (requireCtc && !trimOrEmpty(data.ctc)) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ctc'], message: 'CTC is required by organization settings' });
      }

      if (!isPayrollFieldFilled(data)) return;

      const numericFields = [
        { key: 'ctc', label: 'CTC' },
        { key: 'basicSalary', label: 'Basic salary' },
        { key: 'hra', label: 'HRA' },
      ];
      numericFields.forEach(({ key, label }) => {
        const raw = trimOrEmpty(data[key]);
        if (!raw) return;
        const n = parseOptionalNumber(raw);
        if (Number.isNaN(n) || n < 0) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${label} must be zero or greater`,
          });
        }
      });

      const allowances = trimOrEmpty(data.allowancesJson);
      if (allowances) {
        try {
          const parsed = JSON.parse(allowances);
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            zctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['allowancesJson'],
              message: 'Allowances must be a valid JSON object',
            });
          }
        } catch {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['allowancesJson'],
            message: 'Allowances must be valid JSON',
          });
        }
      }
    });
}

export const payrollStepSchema = createPayrollStepSchema();

export const bankStepSchema = z
  .object({
    accountHolderName: optStr,
    bankName: optStr,
    accountNumber: optStr,
    confirmAccountNumber: optStr,
    ifscCode: optStr,
    branchName: optStr,
    verificationStatus: optStr,
  })
  .superRefine((data, zctx) => {
    const bankFields = ['accountHolderName', 'bankName', 'accountNumber', 'confirmAccountNumber', 'ifscCode'];
    const any = addAllOrNothingIssues(
      bankFields,
      data,
      zctx,
      {
        accountHolderName: 'Account holder name is required when bank details are provided',
        bankName: 'Bank name is required when bank details are provided',
        accountNumber: 'Account number is required when bank details are provided',
        confirmAccountNumber: 'Confirm account number is required when bank details are provided',
        ifscCode: 'IFSC code is required when bank details are provided',
      },
    );

    if (!any) return;

    const acc = trimOrEmpty(data.accountNumber);
    const conf = trimOrEmpty(data.confirmAccountNumber);
    if (acc && conf && acc !== conf) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmAccountNumber'],
        message: 'Account numbers do not match',
      });
    }

    const ifsc = trimOrEmpty(data.ifscCode);
    if (ifsc && !isValidIfsc(ifsc)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ifscCode'],
        message: 'IFSC must be in format ABCD0123456',
      });
    }
  });

export const complianceStepSchema = z
  .object({
    panNumber: optStr,
    aadhaarNumber: optStr,
    uanNumber: optStr,
    esicNumber: optStr,
    pfNumber: optStr,
    passportNumber: optStr,
    passportExpiry: optStr,
  })
  .superRefine((data, zctx) => {
    const pan = trimOrEmpty(data.panNumber);
    if (pan && !isValidPan(pan)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['panNumber'],
        message: 'PAN must be in format ABCDE1234F',
      });
    }

    const aad = trimOrEmpty(data.aadhaarNumber);
    if (aad && !isValidAadhaar(aad)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aadhaarNumber'],
        message: 'Aadhaar must be 12 digits',
      });
    }

    const uan = trimOrEmpty(data.uanNumber);
    if (uan && !isValidUan(uan)) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['uanNumber'],
        message: 'UAN must be 12 digits',
      });
    }

    const esic = trimOrEmpty(data.esicNumber);
    if (esic && esic.length > 32) {
      zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['esicNumber'], message: 'ESIC number is too long' });
    }

    const pf = trimOrEmpty(data.pfNumber);
    if (pf && pf.length > 32) {
      zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pfNumber'], message: 'PF number is too long' });
    }

    const passport = trimOrEmpty(data.passportNumber);
    if (passport && passport.length > 32) {
      zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['passportNumber'], message: 'Passport number is too long' });
    }

    const expiry = trimOrEmpty(data.passportExpiry);
    if (expiry) {
      const d = new Date(expiry);
      if (Number.isNaN(d.getTime())) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['passportExpiry'], message: 'Invalid passport expiry date' });
      } else if (passport && d <= new Date()) {
        zctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passportExpiry'],
          message: 'Passport expiry must be in the future when passport number is provided',
        });
      }
    } else if (passport) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passportExpiry'],
        message: 'Passport expiry is required when passport number is provided',
      });
    }
  });

export function createEmergencyStepSchema(requireAll = false) {
  return z
    .object({
      contactName: optStr,
      contactPhone: optStr,
      relationship: optStr,
    })
    .superRefine((em, zctx) => {
      const n = trimOrEmpty(em.contactName);
      const p = trimOrEmpty(em.contactPhone);
      const r = trimOrEmpty(em.relationship);
      const any = n || p || r;
      const all = n && p && r;

      if (requireAll && !all) {
        if (!n) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['contactName'],
            message: 'Emergency contact name is required by organization settings',
          });
        }
        if (!p) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['contactPhone'],
            message: 'Emergency contact number is required by organization settings',
          });
        }
        if (!r) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['relationship'],
            message: 'Emergency contact relationship is required by organization settings',
          });
        }
      } else if (any && !all) {
        if (!n) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['contactName'],
            message: 'Name is required when adding an emergency contact',
          });
        }
        if (!p) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['contactPhone'],
            message: 'Contact number is required',
          });
        }
        if (!r) {
          zctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['relationship'],
            message: 'Relationship is required',
          });
        }
      }

      if (n && !isValidPersonName(n)) {
        zctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contactName'],
          message: 'Enter a valid contact name (letters only, at least 2 characters)',
        });
      }

      if (p && !isValidPhone(p)) {
        zctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contactPhone'],
          message: hasInvalidPhoneCharacters(p)
            ? 'Contact number must contain digits only (optional +, spaces, or dashes)'
            : 'Enter a valid contact number (8–15 digits)',
        });
      }
    });
}

export const emergencyStepSchema = createEmergencyStepSchema(false);

export function createEmptyDocumentRow(overrides = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    documentType: 'OFFER_LETTER',
    fileName: '',
    mimeType: '',
    sizeBytes: 0,
    dataBase64: undefined,
    storageKey: undefined,
    serverDocumentId: undefined,
    verificationStatus: undefined,
    ...overrides,
  };
}

export function isDocumentRowFilled(row) {
  return Boolean(row?.serverDocumentId || row?.storageKey || row?.dataBase64);
}

export function filterActiveDocumentRows(rows) {
  return (rows || []).filter(isDocumentRowFilled);
}

export function getDeletedDocumentIds(initialIds, currentDocuments) {
  const currentServerIds = new Set(
    filterActiveDocumentRows(currentDocuments)
      .filter((d) => d.serverDocumentId)
      .map((d) => d.serverDocumentId),
  );
  return (initialIds || []).filter((id) => !currentServerIds.has(id));
}

export const documentRowSchema = z
  .object({
    id: z.string(),
    serverDocumentId: z.string().optional(),
    documentType: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    dataBase64: z.string().optional(),
    storageKey: z.string().optional(),
    verificationStatus: z.string().optional(),
  })
  .superRefine((row, zctx) => {
    if (!DOCUMENT_TYPE_VALUES.includes(row.documentType)) {
      zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documentType'], message: 'Select a valid document type' });
    }
    if (row.serverDocumentId) {
      if (!trimOrEmpty(row.fileName)) {
        zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fileName'], message: 'File name is required' });
      }
      return;
    }
    if (!trimOrEmpty(row.fileName)) {
      zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fileName'], message: 'Choose a file to upload' });
    }
    if (!row.storageKey && !row.dataBase64) {
      zctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fileName'], message: 'Choose a file to upload' });
      return;
    }
    if (row.sizeBytes < 1 || row.sizeBytes > MAX_DOCUMENT_BYTES) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sizeBytes'],
        message: `File must be between 1 byte and ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB`,
      });
    }
    const mime = String(row.mimeType || '').toLowerCase();
    const allowed =
      ALLOWED_MIME_PREFIXES.some((m) => mime === m || mime.startsWith(m)) ||
      /\.(pdf|png|jpe?g|doc|docx)$/i.test(row.fileName || '');
    if (!allowed) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mimeType'],
        message: 'File type not allowed. Use PDF, images, or Word documents',
      });
    }
  });

export const accessStepSchema = z
  .object({
    portalRoleLabel: z.string().min(1, 'Select a role'),
    hrmsAccessEnabled: z.boolean(),
    welcomeEmailEnabled: z.boolean(),
    mfaEnabled: z.boolean(),
    temporaryPassword: z.string().optional(),
  })
  .superRefine((data, zctx) => {
    const pwd = trimOrEmpty(data.temporaryPassword);
    if (!pwd) return;
    const { valid, errors } = validatePasswordStrength(pwd);
    if (!valid) {
      zctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['temporaryPassword'],
        message: errors[0],
      });
    }
  });

// --- Schema builder ---

export function buildOnboardingSchemas(options = {}) {
  const requiredFields = Array.isArray(options.requiredFields) ? options.requiredFields : [];
  const employmentContext = options.employmentContext ?? {};

  return {
    basicStepSchema,
    employmentStepSchema: createEmploymentStepSchema(employmentContext),
    experienceStepSchema,
    payrollStepSchema: createPayrollStepSchema({ requireSalary: requiredFields.includes('salary') }),
    bankStepSchema,
    complianceStepSchema,
    emergencyStepSchema: createEmergencyStepSchema(requiredFields.includes('emergency_contact')),
    documentRowSchema,
    accessStepSchema,
  };
}

export function buildFullOnboardingSchema(options = {}) {
  const schemas = buildOnboardingSchemas(options);
  return z.object({
    basic: schemas.basicStepSchema,
    employment: schemas.employmentStepSchema,
    experience: schemas.experienceStepSchema,
    payroll: schemas.payrollStepSchema,
    bank: schemas.bankStepSchema,
    compliance: schemas.complianceStepSchema,
    emergency: schemas.emergencyStepSchema,
    documents: z.preprocess(
      (val) => filterActiveDocumentRows(val),
      z.array(documentRowSchema).optional(),
    ),
    access: schemas.accessStepSchema,
  });
}

export const fullOnboardingSchema = buildFullOnboardingSchema();

export function getStepIndexFromIssuePath(path) {
  if (!path || path.length === 0) return 0;
  const root = String(path[0]);
  if (root === 'basic' || root === 'emergency') return 0;
  if (root === 'employment') return 1;
  if (root === 'experience') return 2;
  if (root === 'payroll' || root === 'bank') return 3;
  if (root === 'compliance') return 4;
  if (root === 'documents') return 5;
  if (root === 'access') return 6;
  return 0;
}

export function validateOnboardingStep(stepIndex, values, options = {}) {
  const schemas = buildOnboardingSchemas(options);

  switch (stepIndex) {
    case 0:
      return z
        .object({ basic: schemas.basicStepSchema, emergency: schemas.emergencyStepSchema })
        .safeParse({ basic: values.basic, emergency: values.emergency ?? {} });
    case 1:
      return z
        .object({ employment: schemas.employmentStepSchema })
        .safeParse({ employment: values.employment });
    case 2:
      return z
        .object({ experience: schemas.experienceStepSchema })
        .safeParse({ experience: values.experience ?? { experiences: [] } });
    case 3:
      return z
        .object({ payroll: schemas.payrollStepSchema, bank: schemas.bankStepSchema })
        .safeParse({ payroll: values.payroll, bank: values.bank });
    case 4:
      return z
        .object({ compliance: schemas.complianceStepSchema })
        .safeParse({ compliance: values.compliance ?? {} });
    case 5:
      return z
        .object({ documents: z.array(schemas.documentRowSchema) })
        .safeParse({ documents: filterActiveDocumentRows(values.documents) });
    case 6:
      return z.object({ access: schemas.accessStepSchema }).safeParse({ access: values.access });
    default:
      return { success: true };
  }
}

export function getDefaultOnboardingValues() {
  return {
    basic: {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      personalEmail: '',
      mobileNumber: '',
      alternateMobile: '',
      profilePhotoUrl: '',
      profilePhotoStorageKey: '',
      profilePhotoFileName: '',
      profilePhotoPreviewUrl: '',
    },
    employment: {
      dateOfJoining: '',
      employmentType: 'FULL_TIME',
      employmentStatus: 'PROBATION',
      officialEmail: '',
      departmentId: '',
      designationId: '',
      hrManagerId: '',
      workMode: 'HYBRID',
      shift: '',
      probationPeriodDays: '',
      noticePeriodDays: '',
      businessUnit: '',
    },
    payroll: {
      ctc: '',
      salaryStructure: '',
      basicSalary: '',
      hra: '',
      allowancesJson: '',
      pfApplicable: true,
      esicApplicable: false,
      taxRegime: 'NEW',
    },
    experience: {
      experiences: [
        {
          previousCompanyName: '',
          previousDesignation: '',
          totalExperienceYears: '',
          lastDrawnCtc: '',
          experienceSummary: '',
        },
      ],
    },
    bank: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      branchName: '',
      verificationStatus: 'PENDING',
    },
    compliance: {
      panNumber: '',
      aadhaarNumber: '',
      uanNumber: '',
      esicNumber: '',
      pfNumber: '',
      passportNumber: '',
      passportExpiry: '',
    },
    emergency: {
      contactName: '',
      contactPhone: '',
      relationship: '',
    },
    documents: [createEmptyDocumentRow()],
    access: {
      portalRoleLabel: 'EMPLOYEE',
      hrmsAccessEnabled: true,
      welcomeEmailEnabled: false,
      mfaEnabled: false,
      temporaryPassword: '',
    },
  };
}

function toDateOrUndefined(s) {
  if (!s || typeof s !== 'string') return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function numOrUndef(v) {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function intOrUndef(v) {
  const n = numOrUndef(v);
  if (n == null) return undefined;
  return Math.round(n);
}

function emergencyRelationshipLabel(value) {
  if (!value || typeof value !== 'string') return undefined;
  const o = EMERGENCY_RELATIONSHIP_OPTIONS.find((x) => x.value === value);
  return o?.label ?? value;
}

function isFilledExperience(exp) {
  return isExperienceRowFilled(exp);
}

/**
 * Maps React Hook Form values → POST /employees/hr-onboarding body
 * @param {ReturnType<typeof getDefaultOnboardingValues>} v
 * @param {{ deletedDocumentIds?: string[] }} [options]
 */
export function buildHrOnboardingPayload(v, options = {}) {
  const allowances =
    typeof v.payroll?.allowancesJson === 'string' && v.payroll.allowancesJson.trim()
      ? (() => {
          try {
            return JSON.parse(v.payroll.allowancesJson);
          } catch {
            return undefined;
          }
        })()
      : undefined;

  const documents = filterActiveDocumentRows(v.documents)
    .filter((d) => d.storageKey || d.dataBase64)
    .map((d) => ({
      documentType: d.documentType,
      fileName: d.fileName,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      storageKey: d.storageKey,
      dataBase64: d.dataBase64,
    }));

  const deletedDocumentIds = (options.deletedDocumentIds || []).filter(Boolean);

  const ecName = v.emergency?.contactName?.trim() ?? '';
  const ecPhone = v.emergency?.contactPhone?.trim() ?? '';
  const ecRelRaw = v.emergency?.relationship?.trim() ?? '';
  const ecRel = emergencyRelationshipLabel(ecRelRaw) ?? ecRelRaw;
  const ecAll = ecName && ecPhone && ecRel;
  const filledExperiences = (v.experience?.experiences || []).filter((exp) => isFilledExperience(exp));
  const primaryExperience = filledExperiences[0] || {};
  const compiledExperienceSummary =
    filledExperiences.length > 1
      ? filledExperiences
          .map((exp, index) => {
            const company = exp.previousCompanyName?.trim() || 'N/A';
            const designation = exp.previousDesignation?.trim() || 'N/A';
            const years = exp.totalExperienceYears?.toString().trim() || 'N/A';
            const ctc = exp.lastDrawnCtc?.toString().trim() || 'N/A';
            const notes = exp.experienceSummary?.trim() || '';
            return `Experience ${index + 1}: ${company} | ${designation} | Years: ${years} | CTC: ${ctc}${notes ? ` | Notes: ${notes}` : ''}`;
          })
          .join('\n')
      : primaryExperience.experienceSummary?.trim() || undefined;

  return {
    basic: {
      firstName: v.basic.firstName.trim(),
      middleName: v.basic.middleName?.trim() || undefined,
      lastName: v.basic.lastName.trim(),
      gender: v.basic.gender || undefined,
      dateOfBirth: toDateOrUndefined(v.basic.dateOfBirth),
      personalEmail: v.basic.personalEmail.trim(),
      officialEmail: v.employment.officialEmail?.trim() || undefined,
      mobileNumber: v.basic.mobileNumber.trim(),
      alternateMobile: v.basic.alternateMobile?.trim() || undefined,
      profilePhotoUrl: v.basic.profilePhotoUrl?.trim() || undefined,
      profilePhotoStorageKey: v.basic.profilePhotoStorageKey || undefined,
      profilePhotoFileName: v.basic.profilePhotoFileName || undefined,
    },
    employment: {
      dateOfJoining: toDateOrUndefined(v.employment.dateOfJoining),
      employmentType: v.employment.employmentType || undefined,
      employmentStatus: v.employment.employmentStatus || undefined,
      departmentId: v.employment.departmentId || undefined,
      designationId: v.employment.designationId || undefined,
      hrManagerId: v.employment.hrManagerId || undefined,
      workMode: v.employment.workMode || undefined,
      shift: v.employment.shift || undefined,
      probationPeriodDays: intOrUndef(v.employment.probationPeriodDays),
      noticePeriodDays: intOrUndef(v.employment.noticePeriodDays),
      businessUnit: v.employment.businessUnit || undefined,
    },
    experience: {
      previousCompanyName: primaryExperience.previousCompanyName?.trim() || undefined,
      previousDesignation: primaryExperience.previousDesignation?.trim() || undefined,
      totalExperienceYears: numOrUndef(primaryExperience.totalExperienceYears),
      lastDrawnCtc: numOrUndef(primaryExperience.lastDrawnCtc),
      experienceSummary: compiledExperienceSummary,
    },
    payroll: {
      ctc: numOrUndef(v.payroll.ctc),
      salaryStructure: v.payroll.salaryStructure || undefined,
      basicSalary: numOrUndef(v.payroll.basicSalary),
      hra: numOrUndef(v.payroll.hra),
      allowances,
      pfApplicable: v.payroll.pfApplicable,
      esicApplicable: v.payroll.esicApplicable,
      taxRegime: v.payroll.taxRegime || undefined,
    },
    bank: {
      accountHolderName: v.bank.accountHolderName || undefined,
      bankName: v.bank.bankName || undefined,
      accountNumber: v.bank.accountNumber || undefined,
      confirmAccountNumber: v.bank.confirmAccountNumber || undefined,
      ifscCode: v.bank.ifscCode || undefined,
      branchName: v.bank.branchName || undefined,
      verificationStatus: v.bank.verificationStatus || 'PENDING',
    },
    compliance: {
      panNumber: v.compliance.panNumber?.trim() || undefined,
      aadhaarNumber: v.compliance.aadhaarNumber?.trim() || undefined,
      uanNumber: v.compliance.uanNumber?.trim() || undefined,
      esicNumber: v.compliance.esicNumber?.trim() || undefined,
      pfNumber: v.compliance.pfNumber?.trim() || undefined,
      passportNumber: v.compliance.passportNumber?.trim() || undefined,
      passportExpiry: toDateOrUndefined(v.compliance.passportExpiry),
    },
    ...(ecAll
      ? {
          emergencyContact: {
            contactName: ecName,
            contactPhone: ecPhone,
            relationship: ecRel,
          },
        }
      : {}),
    documents: documents.length ? documents : undefined,
    ...(deletedDocumentIds.length ? { deletedDocumentIds } : {}),
    access: {
      portalRoleLabel: v.access.portalRoleLabel,
      hrmsAccessEnabled: v.access.hrmsAccessEnabled,
      welcomeEmailEnabled: v.access.welcomeEmailEnabled,
      mfaEnabled: v.access.mfaEnabled,
      temporaryPassword: v.access.temporaryPassword?.trim() || undefined,
    },
  };
}

export function mapEmployeeToOnboardingValues(employee) {
  const base = getDefaultOnboardingValues();
  if (!employee) return base;

  const employmentDetail = employee.employmentDetail || {};
  const salaryDetail = employee.salaryDetail || {};
  const bankDetail = employee.bankDetail || {};
  const accessControl = employee.accessControl || {};
  const emergencyContact = employee.emergencyContactDetail || {};

  return {
    ...base,
    basic: {
      ...base.basic,
      firstName: employee.firstName || '',
      middleName: employee.middleName || '',
      lastName: employee.lastName || '',
      gender: normalizeGender(employee.gender),
      dateOfBirth: employee.dateOfBirth ? String(employee.dateOfBirth).slice(0, 10) : '',
      personalEmail: employee.personalEmail || employee.email || '',
      mobileNumber: employee.phoneNumber || '',
      alternateMobile: employee.alternateMobile || '',
      profilePhotoUrl: employee.profilePhotoUrl || '',
      profilePhotoStorageKey: employee.profilePhotoStorageKey || '',
      profilePhotoFileName: '',
      profilePhotoPreviewUrl: employee.profilePhotoPreviewUrl || employee.profilePhotoUrl || '',
    },
    employment: {
      ...base.employment,
      dateOfJoining: employee.dateOfJoining ? String(employee.dateOfJoining).slice(0, 10) : '',
      officialEmail: employee.officialEmail || employee.email || '',
      employmentType: employmentDetail.employmentType || base.employment.employmentType,
      employmentStatus: employmentDetail.employmentStatus || base.employment.employmentStatus,
      departmentId: employee.departmentId || '',
      designationId: employee.designationId || '',
      hrManagerId: employmentDetail.hrManagerId || '',
      workMode: employmentDetail.workMode || base.employment.workMode,
      shift: employmentDetail.shift || '',
      probationPeriodDays:
        employmentDetail.probationPeriodDays != null ? String(employmentDetail.probationPeriodDays) : '',
      noticePeriodDays:
        employmentDetail.noticePeriodDays != null ? String(employmentDetail.noticePeriodDays) : '',
      businessUnit: employmentDetail.businessUnit || '',
    },
    experience: {
      experiences: [
        {
          previousCompanyName: employmentDetail.previousCompanyName || '',
          previousDesignation: employmentDetail.previousDesignation || '',
          totalExperienceYears: employmentDetail.totalExperienceYears || '',
          lastDrawnCtc: employmentDetail.lastDrawnCtc || '',
          experienceSummary: employmentDetail.experienceSummary || '',
        },
      ],
    },
    payroll: {
      ...base.payroll,
      ctc: salaryDetail.ctc || '',
      salaryStructure: salaryDetail.salaryStructure || '',
      basicSalary: salaryDetail.basicSalary || '',
      hra: salaryDetail.hra || '',
      allowancesJson: salaryDetail.allowancesJson ? JSON.stringify(salaryDetail.allowancesJson) : '',
      pfApplicable: salaryDetail.pfApplicable ?? base.payroll.pfApplicable,
      esicApplicable: salaryDetail.esicApplicable ?? base.payroll.esicApplicable,
      taxRegime: salaryDetail.taxRegime || base.payroll.taxRegime,
    },
    bank: {
      ...base.bank,
      accountHolderName: bankDetail.accountHolderName || '',
      bankName: bankDetail.bankName || '',
      ifscCode: bankDetail.ifscCode || '',
      branchName: bankDetail.branchName || '',
      verificationStatus: bankDetail.verificationStatus || base.bank.verificationStatus,
    },
    compliance: {
      ...base.compliance,
      panNumber: '',
      aadhaarNumber: '',
      uanNumber: employee.uanNumber || '',
      esicNumber: employee.esiNumber || '',
      pfNumber: employee.pfNumber || '',
      passportNumber: employee.passportNumber || '',
      passportExpiry: employee.passportExpiry ? String(employee.passportExpiry).slice(0, 10) : '',
    },
    emergency: {
      contactName: emergencyContact.contactName || '',
      contactPhone: emergencyContact.contactPhone || '',
      relationship: emergencyContact.relationship || '',
    },
    access: {
      ...base.access,
      portalRoleLabel: accessControl.portalRoleLabel || 'EMPLOYEE',
      hrmsAccessEnabled: accessControl.hrmsAccessEnabled ?? true,
      welcomeEmailEnabled: accessControl.welcomeEmailEnabled ?? false,
      mfaEnabled: accessControl.mfaEnabled ?? false,
      temporaryPassword: '',
    },
    documents:
      (employee.documents || []).length > 0
        ? employee.documents.map((doc) =>
            createEmptyDocumentRow({
              id: doc.id,
              serverDocumentId: doc.id,
              documentType: doc.documentType || 'OFFER_LETTER',
              fileName: doc.fileName || '',
              mimeType: doc.mimeType || '',
              sizeBytes: doc.sizeBytes || 0,
              verificationStatus: doc.verificationStatus || 'PENDING',
            }),
          )
        : [createEmptyDocumentRow()],
  };
}
