import { describe, expect, it } from 'vitest';
import {
  getDefaultOnboardingValues,
  getStepIndexFromIssuePath,
  validateOnboardingStep,
  validatePasswordStrength,
} from './onboardingSchema';

const DEPT_ID = '550e8400-e29b-41d4-a716-446655440000';
const DESIGNATION_ID = '550e8400-e29b-41d4-a716-446655440001';

function validMinimalValues() {
  const v = getDefaultOnboardingValues();
  v.basic.firstName = 'Jane';
  v.basic.lastName = 'Doe';
  v.basic.personalEmail = 'jane.doe@example.com';
  v.basic.mobileNumber = '9876543210';
  v.employment.dateOfJoining = '2024-06-01';
  v.employment.departmentId = DEPT_ID;
  v.employment.designationId = DESIGNATION_ID;
  return v;
}

describe('validateOnboardingStep', () => {
  it('step 0 fails with correct paths when required basic fields are missing', () => {
    const result = validateOnboardingStep(0, getDefaultOnboardingValues());
    expect(result.success).toBe(false);
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('basic.firstName');
    expect(paths).toContain('basic.personalEmail');
    expect(paths).toContain('basic.mobileNumber');
  });

  it('step 0 passes with valid minimal basic info', () => {
    const values = validMinimalValues();
    const result = validateOnboardingStep(0, values);
    expect(result.success).toBe(true);
  });

  it('step 0 rejects mobile numbers containing letters', () => {
    const values = validMinimalValues();
    values.basic.mobileNumber = '797asdgjhghjagsd687678687sd';
    const result = validateOnboardingStep(0, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'basic.mobileNumber')).toBe(true);
  });

  it('step 0 rejects invalid emergency contact phone with letters', () => {
    const values = validMinimalValues();
    values.emergency = {
      contactName: 'John Smith',
      contactPhone: 'vdnbavsbdvahjsdtiu575675875675',
      relationship: 'SPOUSE',
    };
    const result = validateOnboardingStep(0, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'emergency.contactPhone')).toBe(true);
  });

  it('step 2 rejects invalid company and designation formats', () => {
    const values = getDefaultOnboardingValues();
    values.experience.experiences[0] = {
      previousCompanyName: 'asd@sdahkjhjkhda',
      previousDesignation: 's:>?,/.,/.,/.,/.1,2312323sadsjdhk',
      totalExperienceYears: '2',
      lastDrawnCtc: '867876',
      experienceSummary: 'asdsd',
    };
    const result = validateOnboardingStep(2, values);
    expect(result.success).toBe(false);
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('experience.experiences.0.previousCompanyName');
    expect(paths).toContain('experience.experiences.0.previousDesignation');
  });

  it('step 1 failure uses employment-prefixed paths', () => {
    const values = validMinimalValues();
    values.employment.departmentId = '';
    const result = validateOnboardingStep(1, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'employment.departmentId')).toBe(true);
  });

  it('step 1 passes with valid employment data', () => {
    const result = validateOnboardingStep(1, validMinimalValues());
    expect(result.success).toBe(true);
  });

  it('step 2 allows empty experience rows', () => {
    const result = validateOnboardingStep(2, getDefaultOnboardingValues());
    expect(result.success).toBe(true);
  });

  it('step 2 requires company and designation when partial row is filled', () => {
    const values = getDefaultOnboardingValues();
    values.experience.experiences[0].lastDrawnCtc = '500000';
    const result = validateOnboardingStep(2, values);
    expect(result.success).toBe(false);
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('experience.experiences.0.previousCompanyName');
    expect(paths).toContain('experience.experiences.0.previousDesignation');
  });

  it('step 3 enforces bank all-or-nothing', () => {
    const values = getDefaultOnboardingValues();
    values.bank.accountNumber = '1234567890';
    const result = validateOnboardingStep(3, values);
    expect(result.success).toBe(false);
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('bank.accountHolderName');
    expect(paths).toContain('bank.ifscCode');
  });

  it('step 3 fails when account numbers do not match', () => {
    const values = getDefaultOnboardingValues();
    values.bank = {
      ...values.bank,
      accountHolderName: 'Jane Doe',
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      confirmAccountNumber: '0987654321',
      ifscCode: 'HDFC0001234',
    };
    const result = validateOnboardingStep(3, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'bank.confirmAccountNumber')).toBe(true);
  });

  it('step 4 rejects invalid PAN at step level', () => {
    const values = getDefaultOnboardingValues();
    values.compliance.panNumber = 'INVALID';
    const result = validateOnboardingStep(4, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'compliance.panNumber')).toBe(true);
  });

  it('step 4 rejects invalid Aadhaar at step level', () => {
    const values = getDefaultOnboardingValues();
    values.compliance.aadhaarNumber = '123';
    const result = validateOnboardingStep(4, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'compliance.aadhaarNumber')).toBe(true);
  });

  it('step 6 rejects weak temporary password', () => {
    const values = getDefaultOnboardingValues();
    values.access.temporaryPassword = 'short';
    const result = validateOnboardingStep(6, values);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.join('.') === 'access.temporaryPassword')).toBe(true);
  });

  it('requires emergency contact when org setting demands it', () => {
    const values = validMinimalValues();
    const result = validateOnboardingStep(0, values, { requiredFields: ['emergency_contact'] });
    expect(result.success).toBe(false);
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('emergency.contactName');
  });
});

describe('getStepIndexFromIssuePath', () => {
  it('maps issue roots to wizard step indices', () => {
    expect(getStepIndexFromIssuePath(['employment', 'departmentId'])).toBe(1);
    expect(getStepIndexFromIssuePath(['bank', 'ifscCode'])).toBe(3);
    expect(getStepIndexFromIssuePath(['access', 'temporaryPassword'])).toBe(6);
  });
});

describe('validatePasswordStrength', () => {
  it('accepts strong passwords', () => {
    expect(validatePasswordStrength('SecurePass123!').valid).toBe(true);
  });

  it('rejects passwords missing complexity rules', () => {
    const result = validatePasswordStrength('alllowercase');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
