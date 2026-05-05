import { z } from 'zod';
import { EMERGENCY_RELATIONSHIP_OPTIONS } from './constants';

const optStr = z.union([z.string(), z.literal('')]).optional();

export const basicStepSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(120),
  middleName: optStr,
  lastName: z.string().min(1, 'Last name is required').max(120),
  gender: optStr,
  dateOfBirth: z
    .string()
    .optional()
    .refine((s) => s == null || !s || !s.trim() || !Number.isNaN(new Date(s).getTime()), {
      message: 'Invalid date of birth',
    }),
  personalEmail: z.string().min(1, 'Required').email('Invalid email'),
  officialEmail: z.union([z.string().email(), z.literal('')]).optional(),
  mobileNumber: z.string().min(10, 'Enter a valid mobile number').max(24),
  alternateMobile: optStr,
  profilePhotoUrl: optStr,
});

export const employmentStepSchema = z.object({
  dateOfJoining: z
    .string()
    .min(1, 'Date of joining is required')
    .refine((s) => !Number.isNaN(new Date(s).getTime()), { message: 'Enter a valid date of joining' }),
  employmentType: optStr,
  employmentStatus: optStr,
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  reportingManagerId: optStr,
  hrManagerId: optStr,
  workLocation: optStr,
  workMode: optStr,
  shift: optStr,
  probationPeriodDays: z.union([z.string(), z.number()]).optional(),
  noticePeriodDays: z.union([z.string(), z.number()]).optional(),
  businessUnit: optStr,
  team: optStr,
  gradeBand: optStr,
  costCenter: optStr,
});

export const payrollStepSchema = z.object({
  ctc: optStr,
  salaryStructure: optStr,
  basicSalary: optStr,
  hra: optStr,
  allowancesJson: optStr,
  pfApplicable: z.boolean().optional(),
  esicApplicable: z.boolean().optional(),
  taxRegime: optStr,
});

export const bankStepSchema = z.object({
  accountHolderName: optStr,
  bankName: optStr,
  accountNumber: optStr,
  confirmAccountNumber: optStr,
  ifscCode: optStr,
  branchName: optStr,
  verificationStatus: optStr,
});

export const complianceStepSchema = z.object({
  panNumber: optStr,
  aadhaarNumber: optStr,
  uanNumber: optStr,
  esicNumber: optStr,
  pfNumber: optStr,
  passportNumber: optStr,
  passportExpiry: optStr,
});

export const emergencyStepSchema = z
  .object({
    contactName: optStr,
    contactPhone: optStr,
    relationship: optStr,
  })
  .superRefine((em, ctx) => {
    const n = em.contactName?.trim() ?? '';
    const p = em.contactPhone?.trim() ?? '';
    const r = em.relationship?.trim() ?? '';
    const any = n || p || r;
    const all = n && p && r;
    if (any && !all) {
      if (!n) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contactName'],
          message: 'Name is required when adding an emergency contact',
        });
      }
      if (!p) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contactPhone'],
          message: 'Contact number is required',
        });
      }
      if (!r) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['relationship'],
          message: 'Relationship is required',
        });
      }
    }
    if (p) {
      const digits = p.replace(/\D/g, '');
      if (digits.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contactPhone'],
          message: 'Enter at least 8 digits in the contact number',
        });
      }
    }
  });

export const documentRowSchema = z.object({
  id: z.string(),
  documentType: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  dataBase64: z.string().optional(),
});

export const accessStepSchema = z.object({
  portalRoleLabel: z.string().min(1, 'Select a role'),
  hrmsAccessEnabled: z.boolean(),
  welcomeEmailEnabled: z.boolean(),
  mfaEnabled: z.boolean(),
  temporaryPassword: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 0 || v.length >= 12, { message: 'Temporary password must be at least 12 characters' }),
});

export function validateOnboardingStep(stepIndex, values) {
  switch (stepIndex) {
    case 0:
      return basicStepSchema.safeParse(values.basic);
    case 1:
      return employmentStepSchema.safeParse(values.employment);
    case 2:
      return z
        .object({ payroll: payrollStepSchema, bank: bankStepSchema })
        .safeParse({ payroll: values.payroll, bank: values.bank });
    case 3:
      return complianceStepSchema.safeParse(values.compliance);
    case 4:
      return z
        .object({ emergency: emergencyStepSchema })
        .safeParse({ emergency: values.emergency ?? {} });
    case 5:
      return z.object({ documents: z.array(documentRowSchema) }).safeParse({ documents: values.documents || [] });
    case 6:
      return accessStepSchema.safeParse(values.access);
    default:
      return { success: true };
  }
}

export const fullOnboardingSchema = z
  .object({
    basic: basicStepSchema,
    employment: employmentStepSchema,
    payroll: payrollStepSchema,
    bank: bankStepSchema,
    compliance: complianceStepSchema,
    emergency: emergencyStepSchema,
    documents: z.array(documentRowSchema).optional(),
    access: accessStepSchema,
  })
  .superRefine((data, ctx) => {
    const pan = data.compliance?.panNumber?.trim();
    if (pan && !/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(pan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['compliance', 'panNumber'],
        message: 'PAN must be in format ABCDE1234F',
      });
    }
    const aad = data.compliance?.aadhaarNumber?.replace(/\s/g, '') ?? '';
    if (aad && !/^\d{12}$/.test(aad)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['compliance', 'aadhaarNumber'],
        message: 'Aadhaar must be 12 digits',
      });
    }
    const acc = data.bank?.accountNumber?.trim() ?? '';
    const conf = data.bank?.confirmAccountNumber?.trim() ?? '';
    if (acc && conf && acc !== conf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bank', 'confirmAccountNumber'],
        message: 'Account numbers do not match',
      });
    }
  });

export function getDefaultOnboardingValues() {
  return {
    basic: {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      personalEmail: '',
      officialEmail: '',
      mobileNumber: '',
      alternateMobile: '',
      profilePhotoUrl: '',
    },
    employment: {
      dateOfJoining: '',
      employmentType: 'FULL_TIME',
      employmentStatus: 'PROBATION',
      department: '',
      designation: '',
      reportingManagerId: '',
      hrManagerId: '',
      workLocation: '',
      workMode: 'HYBRID',
      shift: '',
      probationPeriodDays: '',
      noticePeriodDays: '',
      businessUnit: '',
      team: '',
      gradeBand: '',
      costCenter: '',
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
    documents: [],
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

/**
 * Maps React Hook Form values → POST /employees/hr-onboarding body
 * @param {ReturnType<typeof getDefaultOnboardingValues>} v
 */
export function buildHrOnboardingPayload(v) {
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

  const documents = (v.documents || [])
    .filter((d) => d.dataBase64)
    .map((d) => ({
      documentType: d.documentType,
      fileName: d.fileName,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      dataBase64: d.dataBase64,
    }));

  const ecName = v.emergency?.contactName?.trim() ?? '';
  const ecPhone = v.emergency?.contactPhone?.trim() ?? '';
  const ecRelRaw = v.emergency?.relationship?.trim() ?? '';
  const ecRel = emergencyRelationshipLabel(ecRelRaw) ?? ecRelRaw;
  const ecAll = ecName && ecPhone && ecRel;

  return {
    basic: {
      firstName: v.basic.firstName.trim(),
      middleName: v.basic.middleName?.trim() || undefined,
      lastName: v.basic.lastName.trim(),
      gender: v.basic.gender || undefined,
      dateOfBirth: toDateOrUndefined(v.basic.dateOfBirth),
      personalEmail: v.basic.personalEmail.trim(),
      officialEmail: v.basic.officialEmail?.trim() || undefined,
      mobileNumber: v.basic.mobileNumber.trim(),
      alternateMobile: v.basic.alternateMobile?.trim() || undefined,
      profilePhotoUrl: v.basic.profilePhotoUrl?.trim() || undefined,
    },
    employment: {
      dateOfJoining: toDateOrUndefined(v.employment.dateOfJoining),
      employmentType: v.employment.employmentType || undefined,
      employmentStatus: v.employment.employmentStatus || undefined,
      department: v.employment.department.trim(),
      designation: v.employment.designation.trim(),
      reportingManagerId: v.employment.reportingManagerId || undefined,
      hrManagerId: v.employment.hrManagerId || undefined,
      workLocation: v.employment.workLocation || undefined,
      workMode: v.employment.workMode || undefined,
      shift: v.employment.shift || undefined,
      probationPeriodDays: intOrUndef(v.employment.probationPeriodDays),
      noticePeriodDays: intOrUndef(v.employment.noticePeriodDays),
      businessUnit: v.employment.businessUnit || undefined,
      team: v.employment.team || undefined,
      gradeBand: v.employment.gradeBand || undefined,
      costCenter: v.employment.costCenter || undefined,
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
    access: {
      portalRoleLabel: v.access.portalRoleLabel,
      hrmsAccessEnabled: v.access.hrmsAccessEnabled,
      welcomeEmailEnabled: v.access.welcomeEmailEnabled,
      mfaEnabled: v.access.mfaEnabled,
      temporaryPassword: v.access.temporaryPassword?.trim() || undefined,
    },
  };
}
