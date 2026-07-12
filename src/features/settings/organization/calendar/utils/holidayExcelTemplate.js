import * as XLSX from 'xlsx';

export const HOLIDAY_EXCEL_HEADERS = ['Date', 'Name', 'Type', 'Location'];

/**
 * Build and download an Excel template for the given calendar year.
 * @param {number} year
 */
export function downloadHolidayExcelTemplate(year) {
  const sampleRows = [
    {
      Date: `${year}-01-26`,
      Name: 'Republic Day',
      Type: 'GENERAL',
      Location: '',
    },
    {
      Date: `${year}-08-15`,
      Name: 'Independence Day',
      Type: 'GENERAL',
      Location: 'All',
    },
    {
      Date: `${year}-10-02`,
      Name: 'Gandhi Jayanti (optional)',
      Type: 'RESTRICTED',
      Location: '',
    },
  ];

  const holidaysSheet = XLSX.utils.json_to_sheet(sampleRows, {
    header: HOLIDAY_EXCEL_HEADERS,
  });
  holidaysSheet['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 14 },
    { wch: 20 },
  ];

  const instructions = [
    ['Organization holiday calendar import'],
    [''],
    ['Required columns'],
    ['Date', 'YYYY-MM-DD (must fall within the selected calendar year)'],
    ['Name', 'Holiday name (max 191 characters)'],
    ['Type', 'GENERAL or RESTRICTED'],
    ['Location', 'Optional. Leave blank or All for org-wide; otherwise use an exact location name'],
    [''],
    ['Tips'],
    ['Keep the header row exactly as shown on the Holidays sheet'],
    ['Extra columns are ignored'],
    ['Duplicate Date + Location rows: the last row wins'],
    ['Existing holidays with the same Date + Location will be overwritten on import'],
  ];
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 16 }, { wch: 72 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, holidaysSheet, 'Holidays');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  XLSX.writeFile(workbook, `holiday-calendar-${year}-template.xlsx`);
}
