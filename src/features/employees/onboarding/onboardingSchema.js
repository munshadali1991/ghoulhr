import { z } from 'zod';
import { EMERGENCY_RELATIONSHIP_OPTIONS, normalizeGender } from './constants';

const optStr = z.union([z.string(), z.literal('')]).optional();

export const basicStepSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(120),
  middleName: optStr,
  lastName: z.string().min(1, 'Last name is required').max(120),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']),
  dateOfBirth: z
    .string()
    .optional()
    .refine((s) => s == null || !s || !s.trim() || !Number.isNaN(new Date(s).getTime()), {
      message: 'Invalid date of birth',
    }),
  personalEmail: z.string().min(1, 'Required').email('Invalid email'),
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
  officialEmail: z.union([z.string().email(), z.literal('')]).optional(),
  departmentId: z.string().uuid('Department is required'),
  designationId: z.string().uuid('Designation is required'),
  reportingManagerId: optStr,
  hrManagerId: optStr,
  workMode: optStr,
  shift: optStr,
  probationPeriodDays: z.union([z.string(), z.number()]).optional(),
  noticePeriodDays: z.union([z.string(), z.number()]).optional(),
  businessUnit: optStr,
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

export const experienceEntrySchema = z.object({
  previousCompanyName: optStr,
  previousDesignation: optStr,
  totalExperienceYears: optStr,
  lastDrawnCtc: optStr,
  experienceSummary: optStr,
});

export const experienceStepSchema = z.object({
  experiences: z.array(experienceEntrySchema).min(1),
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
      return z
        .object({ basic: basicStepSchema, emergency: emergencyStepSchema })
        .safeParse({ basic: values.basic, emergency: values.emergency ?? {} });
    case 1:
      return employmentStepSchema.safeParse(values.employment);
    case 2:
      return experienceStepSchema.safeParse(values.experience);
    case 3:
      return z
        .object({ payroll: payrollStepSchema, bank: bankStepSchema })
        .safeParse({ payroll: values.payroll, bank: values.bank });
    case 4:
      return complianceStepSchema.safeParse(values.compliance);
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
    experience: experienceStepSchema,
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
      gender: 'MALE',
      dateOfBirth: '',
      personalEmail: '',
      mobileNumber: '',
      alternateMobile: '',
      profilePhotoUrl: '',
    },
    employment: {
      dateOfJoining: '',
      employmentType: 'FULL_TIME',
      employmentStatus: 'PROBATION',
      officialEmail: '',
      departmentId: '',
      designationId: '',
      reportingManagerId: '',
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

function isFilledExperience(exp) {
  return (
    exp?.previousCompanyName?.trim() ||
    exp?.previousDesignation?.trim() ||
    exp?.totalExperienceYears?.toString().trim() ||
    exp?.lastDrawnCtc?.toString().trim() ||
    exp?.experienceSummary?.trim()
  );
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
    },
    employment: {
      dateOfJoining: toDateOrUndefined(v.employment.dateOfJoining),
      employmentType: v.employment.employmentType || undefined,
      employmentStatus: v.employment.employmentStatus || undefined,
      departmentId: v.employment.departmentId || undefined,
      designationId: v.employment.designationId || undefined,
      reportingManagerId: v.employment.reportingManagerId || undefined,
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
    },
    employment: {
      ...base.employment,
      dateOfJoining: employee.dateOfJoining ? String(employee.dateOfJoining).slice(0, 10) : '',
      officialEmail: employee.officialEmail || employee.email || '',
      employmentType: employmentDetail.employmentType || base.employment.employmentType,
      employmentStatus: employmentDetail.employmentStatus || base.employment.employmentStatus,
      departmentId: employee.departmentId || '',
      designationId: employee.designationId || '',
      reportingManagerId: employmentDetail.reportingManagerId || '',
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
  };
}
