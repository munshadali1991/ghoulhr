import { describe, expect, it } from 'vitest';
import {
  formatFinancialYearDetailed,
  formatFinancialYearLabel,
  getFinancialYearRange,
} from './organizationFyUtils';

describe('organizationFyUtils', () => {
  it('computes Apr–Mar FY when reference is mid-year', () => {
    const ref = new Date(2025, 5, 15); // June 2025
    expect(getFinancialYearRange('4', ref)).toEqual({
      startYear: 2025,
      endYear: 2026,
      startMonth: 4,
      endMonth: 3,
    });
    expect(formatFinancialYearLabel('4', ref)).toBe('Apr 2025 – Mar 2026');
    expect(formatFinancialYearDetailed('4', ref)).toBe('1 Apr 2025 – 31 Mar 2026');
  });

  it('computes Jan–Dec FY for calendar year orgs', () => {
    const ref = new Date(2025, 5, 15);
    expect(formatFinancialYearLabel('1', ref)).toBe('Jan 2025 – Dec 2025');
  });

  it('uses previous FY start when reference is before start month', () => {
    const ref = new Date(2025, 1, 1); // Feb 2025, FY starts April
    expect(getFinancialYearRange('4', ref)).toEqual({
      startYear: 2024,
      endYear: 2025,
      startMonth: 4,
      endMonth: 3,
    });
  });
});
