import * as XLSX from 'xlsx';
import { HOLIDAY_EXCEL_HEADERS } from './holidayExcelTemplate';

export const MAX_HOLIDAY_IMPORT_ROWS = 500;
export const MAX_HOLIDAY_NAME_LENGTH = 191;

/**
 * @param {string | number | Date | null | undefined} value
 * @returns {string | null} YYYY-MM-DD or null
 */
export function normalizeHolidayDate(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDateLocal(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return toIsoDateUtc(d);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (isValidYmd(y, m, d)) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    return null;
  }

  const slash = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const y = Number(slash[3]);
    // Prefer DD/MM/YYYY when day > 12; otherwise treat as ambiguous and require ISO
    if (a > 12 && b >= 1 && b <= 12 && isValidYmd(y, b, a)) {
      return `${y}-${pad2(b)}-${pad2(a)}`;
    }
    if (b > 12 && a >= 1 && a <= 12 && isValidYmd(y, a, b)) {
      return `${y}-${pad2(a)}-${pad2(b)}`;
    }
    // Ambiguous MDY/DMY — only accept if both parts <= 12 and look like YYYY-MM-DD intent failed
    return null;
  }

  const asDate = new Date(raw);
  if (!Number.isNaN(asDate.getTime()) && /^\d{4}/.test(raw)) {
    return toIsoDateLocal(asDate);
  }

  return null;
}

/**
 * @param {string | null | undefined} value
 * @returns {'GENERAL' | 'RESTRICTED' | null}
 */
export function normalizeHolidayType(value) {
  if (value == null || value === '') return null;
  const raw = String(value).trim().toUpperCase().replace(/\s+/g, '_');
  if (raw === 'GENERAL' || raw === 'GEN') return 'GENERAL';
  if (raw === 'RESTRICTED' || raw === 'OPTIONAL' || raw === 'REST') return 'RESTRICTED';
  return null;
}

/**
 * @param {string | null | undefined} value
 * @returns {{ locationId: string | null, locationName: string | null, error?: string }}
 */
export function resolveLocationName(value, locations) {
  const raw = value == null ? '' : String(value).trim();
  if (!raw || /^all(\s+locations)?$/i.test(raw)) {
    return { locationId: null, locationName: null };
  }
  const match = (locations || []).find(
    (l) => l.name.trim().toLowerCase() === raw.toLowerCase(),
  );
  if (!match) {
    return {
      locationId: null,
      locationName: raw,
      error: `Unknown location "${raw}"`,
    };
  }
  return { locationId: match.id, locationName: match.name };
}

/**
 * @param {string|null} holidayDate
 * @param {string|null} locationId
 */
export function holidayMatchKey(holidayDate, locationId) {
  return `${holidayDate || ''}|${locationId || ''}`;
}

/**
 * Validate a single preview row against year + locations.
 * @returns {string[]}
 */
export function validateHolidayImportRow(row, year, locations) {
  const errors = [];
  if (!row.name?.trim()) {
    errors.push('Name is required');
  } else if (row.name.trim().length > MAX_HOLIDAY_NAME_LENGTH) {
    errors.push(`Name must be at most ${MAX_HOLIDAY_NAME_LENGTH} characters`);
  }

  if (!row.holidayDate) {
    errors.push('Date is required');
  } else {
    const y = Number(row.holidayDate.slice(0, 4));
    if (y !== year) {
      errors.push(`Date must fall within ${year}`);
    }
  }

  if (!row.holidayType || (row.holidayType !== 'GENERAL' && row.holidayType !== 'RESTRICTED')) {
    errors.push('Type must be GENERAL or RESTRICTED');
  }

  if (row.locationName && !row.locationId) {
    const resolved = resolveLocationName(row.locationName, locations);
    if (resolved.error) errors.push(resolved.error);
  }

  return errors;
}

/**
 * Parse an uploaded Excel File into validated preview rows.
 * @param {File} file
 * @param {{ year: number, locations: { id: string, name: string }[] }} options
 */
export async function parseHolidayExcelFile(file, { year, locations }) {
  if (!file) {
    return { ok: false, error: 'No file selected', rows: [], collapsedDuplicates: 0 };
  }

  const name = file.name?.toLowerCase() || '';
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
    return {
      ok: false,
      error: 'Please upload an Excel file (.xlsx)',
      rows: [],
      collapsedDuplicates: 0,
    };
  }

  let workbook;
  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  } catch {
    return {
      ok: false,
      error: 'Could not read this Excel file. It may be corrupt.',
      rows: [],
      collapsedDuplicates: 0,
    };
  }

  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase() === 'holidays') ||
    workbook.SheetNames[0];
  if (!sheetName) {
    return { ok: false, error: 'Excel file has no sheets', rows: [], collapsedDuplicates: 0 };
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: true,
  });

  if (!matrix.length) {
    return {
      ok: false,
      error: 'The sheet is empty. Download the template and add holidays.',
      rows: [],
      collapsedDuplicates: 0,
    };
  }

  const headerRow = matrix[0].map((c) => String(c ?? '').trim());
  const headerIndex = mapHeaderIndexes(headerRow);
  const missing = HOLIDAY_EXCEL_HEADERS.filter(
    (h) => h !== 'Location' && headerIndex[h] == null,
  );
  if (missing.length) {
    return {
      ok: false,
      error: `Missing required column(s): ${missing.join(', ')}`,
      rows: [],
      collapsedDuplicates: 0,
    };
  }

  /** @type {Map<string, object>} */
  const byKey = new Map();
  let collapsedDuplicates = 0;
  let sourceRowCount = 0;

  for (let i = 1; i < matrix.length; i += 1) {
    const cells = matrix[i];
    if (!cells || cells.every((c) => c == null || String(c).trim() === '')) {
      continue;
    }
    sourceRowCount += 1;

    const dateRaw = cells[headerIndex.Date];
    const nameRaw = cells[headerIndex.Name];
    const typeRaw = cells[headerIndex.Type];
    const locationRaw =
      headerIndex.Location != null ? cells[headerIndex.Location] : '';

    const holidayDate = normalizeHolidayDate(dateRaw);
    const holidayType = normalizeHolidayType(typeRaw);
    const nameValue = nameRaw == null ? '' : String(nameRaw).trim();
    const locationResolved = resolveLocationName(locationRaw, locations);

    const row = {
      key: `row-${i}`,
      holidayDate: holidayDate || '',
      name: nameValue,
      holidayType: holidayType || '',
      locationId: locationResolved.locationId,
      locationName: locationResolved.locationName,
      errors: [],
      willOverwrite: false,
    };

    if (!holidayDate && dateRaw != null && String(dateRaw).trim() !== '') {
      row.errors.push('Invalid date — use YYYY-MM-DD');
    }
    if (!holidayType && typeRaw != null && String(typeRaw).trim() !== '') {
      row.errors.push('Type must be GENERAL or RESTRICTED');
    }
    if (locationResolved.error) {
      row.errors.push(locationResolved.error);
    }

    row.errors.push(...validateHolidayImportRow(row, year, locations));
    row.errors = [...new Set(row.errors)];

    const matchKey = holidayMatchKey(row.holidayDate || `invalid-${i}`, row.locationId);
    if (byKey.has(matchKey) && row.holidayDate) {
      collapsedDuplicates += 1;
    }
    byKey.set(matchKey, row);
  }

  if (sourceRowCount === 0) {
    return {
      ok: false,
      error: 'No holiday rows found. Add at least one row below the header.',
      rows: [],
      collapsedDuplicates: 0,
    };
  }

  if (byKey.size > MAX_HOLIDAY_IMPORT_ROWS) {
    return {
      ok: false,
      error: `Too many rows (max ${MAX_HOLIDAY_IMPORT_ROWS}). Split the file and try again.`,
      rows: [],
      collapsedDuplicates: 0,
    };
  }

  const rows = [...byKey.values()].map((row, idx) => ({
    ...row,
    key: `preview-${idx}`,
  }));

  return { ok: true, error: null, rows, collapsedDuplicates };
}

/**
 * @param {object[]} rows
 * @param {object[]} existingHolidays
 */
export function annotateOverwriteFlags(rows, existingHolidays) {
  const existingKeys = new Set(
    (existingHolidays || []).map((h) => holidayMatchKey(h.holidayDate, h.locationId)),
  );
  return rows.map((row) => ({
    ...row,
    willOverwrite: Boolean(row.holidayDate) && existingKeys.has(holidayMatchKey(row.holidayDate, row.locationId)),
  }));
}

function mapHeaderIndexes(headerRow) {
  /** @type {Record<string, number>} */
  const index = {};
  headerRow.forEach((label, i) => {
    const normalized = String(label).trim().toLowerCase();
    if (normalized === 'date' || normalized === 'holiday date') index.Date = i;
    if (normalized === 'name' || normalized === 'holiday name') index.Name = i;
    if (normalized === 'type' || normalized === 'holiday type') index.Type = i;
    if (normalized === 'location' || normalized === 'location name') index.Location = i;
  });
  return index;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isValidYmd(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toIsoDateUtc(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function toIsoDateLocal(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
