import { describe, expect, it } from 'vitest';
import {
  getEssQaMockScenario,
  getMockEmployeeSwipes,
  getMockLeaveCalendar,
  getMockLeaveTransactions,
  getMockTeamOnLeave,
  getMockWhoIsIn,
} from './essQaMocks';
import { formatDaysCount, formatEmployeeCode, leaveStatusChipProps } from '../utils/displayFormat';

describe('essQaMocks stress fixtures', () => {
  it('who-is-in includes long names, null codes, half-day leave, night shift', () => {
    const data = getMockWhoIsIn('2026-02-28');
    expect(data.timezone).toBe('Asia/Kolkata');
    expect(data.notYetIn.some((p) => p.name.length > 40)).toBe(true);
    expect(data.notYetIn.some((p) => p.employeeCode == null)).toBe(true);
    expect(data.notYetIn.some((p) => /Night Shift/.test(p.shiftName || ''))).toBe(true);
    expect(data.outOfOffice.onLeave.some((p) => p.daysCount === 0.5)).toBe(true);
    expect(data.outOfOffice.onLeave.every((p) => p.status === 'APPROVED')).toBe(true);
  });

  it('employee swipes paginate and include null device fields', () => {
    const page1 = getMockEmployeeSwipes({
      from: '2026-02-01',
      to: '2026-02-28',
      page: 1,
      pageSize: 25,
    });
    expect(page1.total).toBeGreaterThan(50);
    expect(page1.items).toHaveLength(25);
    expect(page1.items.some((r) => r.doorAddress == null)).toBe(true);
    expect(page1.items.some((r) => r.employeeCode == null)).toBe(true);
  });

  it('team on leave includes cross-month dates and half days', () => {
    const data = getMockTeamOnLeave();
    expect(data.thisMonth.some((p) => p.days === 0.5)).toBe(true);
    expect(
      data.thisMonth.some((p) => p.dates.some((d) => d.startsWith('2026-01'))),
    ).toBe(true);
  });

  it('leave calendar leap February has 29 days and leap marker', () => {
    const data = getMockLeaveCalendar(2024, 2, 'team');
    expect(data.days['2024-02-29']?.onLeave).toBe(true);
    expect(data.days['2024-02-31']).toBeUndefined();
  });

  it('leave transactions keep unique ids for same-name same-day rows', () => {
    const data = getMockLeaveTransactions('2026-02-28', 'team');
    const ids = data.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(data.items.some((i) => i.days === 0.5)).toBe(true);
  });

  it('leave transactions holidays match calendar dots on 27/28', () => {
    const day27 = getMockLeaveTransactions('2026-08-27', 'me');
    expect(day27.holidays).toHaveLength(1);
    expect(day27.holidays[0].holidayType).toBe('Restricted Holiday');

    const day28 = getMockLeaveTransactions('2026-08-28', 'me');
    expect(day28.holidays).toHaveLength(1);
    expect(day28.holidays[0].holidayType).toBe('General Holiday');

    const day15 = getMockLeaveTransactions('2026-08-15', 'me');
    expect(day15.holidays).toEqual([]);
  });
});

describe('displayFormat helpers', () => {
  it('formats half days and missing codes', () => {
    expect(formatDaysCount(0.5)).toBe('0.5 day');
    expect(formatDaysCount(1)).toBe('1 day');
    expect(formatDaysCount(null)).toBe('—');
    expect(formatEmployeeCode(null)).toBe('');
    expect(formatEmployeeCode('E-1')).toBe('#E-1');
  });

  it('maps leave status chip colors', () => {
    expect(leaveStatusChipProps('APPROVED').color).toBe('success');
    expect(leaveStatusChipProps('PENDING').color).toBe('warning');
    expect(leaveStatusChipProps('REJECTED').color).toBe('error');
  });
});
