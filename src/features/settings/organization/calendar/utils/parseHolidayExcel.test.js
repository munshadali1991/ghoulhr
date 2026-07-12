import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import {
  annotateOverwriteFlags,
  holidayMatchKey,
  normalizeHolidayDate,
  normalizeHolidayType,
  parseHolidayExcelFile,
  resolveLocationName,
  validateHolidayImportRow,
} from './parseHolidayExcel';

describe('parseHolidayExcel utils', () => {
  it('normalizes ISO and Excel serial dates', () => {
    expect(normalizeHolidayDate('2026-01-26')).toBe('2026-01-26');
    expect(normalizeHolidayDate('26/01/2026')).toBe('2026-01-26');
    // Excel serial for 2026-01-26
    const serial = XLSX.SSF.parse_date_code
      ? null
      : null;
    void serial;
    expect(normalizeHolidayDate(46048)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('rejects ambiguous slash dates', () => {
    expect(normalizeHolidayDate('01/02/2026')).toBeNull();
  });

  it('normalizes holiday types', () => {
    expect(normalizeHolidayType('general')).toBe('GENERAL');
    expect(normalizeHolidayType('Restricted')).toBe('RESTRICTED');
    expect(normalizeHolidayType('optional')).toBe('RESTRICTED');
    expect(normalizeHolidayType('nope')).toBeNull();
  });

  it('resolves location names', () => {
    const locations = [{ id: 'loc-1', name: 'Mumbai' }];
    expect(resolveLocationName('', locations)).toEqual({
      locationId: null,
      locationName: null,
    });
    expect(resolveLocationName('All', locations)).toEqual({
      locationId: null,
      locationName: null,
    });
    expect(resolveLocationName('Mumbai', locations)).toEqual({
      locationId: 'loc-1',
      locationName: 'Mumbai',
    });
    expect(resolveLocationName('Pune', locations).error).toMatch(/Unknown location/);
  });

  it('validates rows against year', () => {
    const errors = validateHolidayImportRow(
      {
        name: 'Republic Day',
        holidayDate: '2025-01-26',
        holidayType: 'GENERAL',
        locationId: null,
      },
      2026,
      [],
    );
    expect(errors.some((e) => e.includes('2026'))).toBe(true);
  });

  it('annotates overwrite flags by date+location', () => {
    const rows = [
      {
        holidayDate: '2026-01-26',
        locationId: null,
        name: 'Republic Day',
        holidayType: 'GENERAL',
        errors: [],
      },
    ];
    const existing = [{ holidayDate: '2026-01-26', locationId: null, name: 'Old' }];
    const annotated = annotateOverwriteFlags(rows, existing);
    expect(annotated[0].willOverwrite).toBe(true);
    expect(holidayMatchKey('2026-01-26', null)).toBe('2026-01-26|');
  });

  it('parses a valid workbook and collapses duplicates', async () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Date', 'Name', 'Type', 'Location'],
      ['2026-01-26', 'Republic Day', 'GENERAL', ''],
      ['2026-01-26', 'Republic Day Updated', 'GENERAL', ''],
      ['2026-08-15', 'Independence Day', 'GENERAL', 'All'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Holidays');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buffer], 'holidays.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const result = await parseHolidayExcelFile(file, { year: 2026, locations: [] });
    expect(result.ok).toBe(true);
    expect(result.collapsedDuplicates).toBe(1);
    expect(result.rows).toHaveLength(2);
    expect(result.rows.find((r) => r.holidayDate === '2026-01-26')?.name).toBe(
      'Republic Day Updated',
    );
  });

  it('rejects missing required headers', async () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Date', 'Holiday'],
      ['2026-01-26', 'Republic Day'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Holidays');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new File([buffer], 'bad.xlsx');

    const result = await parseHolidayExcelFile(file, { year: 2026, locations: [] });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing required column/);
  });
});
