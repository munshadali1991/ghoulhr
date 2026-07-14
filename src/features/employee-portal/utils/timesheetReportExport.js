const REPORT_HEADERS = [
  'Date',
  'Category',
  'Work Area/Description',
  'Hours',
  'Ref #',
];

/**
 * @param {Array<{ workDate: string, categoryLabel: string, workAreaDescription: string, hoursSpent: number, refNumber: string }>} rows
 */
export function reportRowsToMatrix(rows) {
  return [
    REPORT_HEADERS,
    ...rows.map((r) => [
      r.workDate,
      r.categoryLabel,
      r.workAreaDescription,
      String(r.hoursSpent),
      r.refNumber ?? '',
    ]),
  ];
}

function escapeCsvCell(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * @param {string[][]} matrix
 */
export function matrixToCsv(matrix) {
  return matrix.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

/**
 * @param {string} filename
 * @param {string} content
 * @param {string} mime
 */
export function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * @param {string[][]} matrix
 */
export async function copyReportToClipboard(matrix) {
  const tsv = matrix.map((row) => row.join('\t')).join('\n');
  await navigator.clipboard.writeText(tsv);
}

/**
 * @param {string[][]} matrix
 * @param {string} title
 */
export function printReportAsPdf(matrix, title = 'My Timesheet Report') {
  const htmlRows = matrix
    .slice(1)
    .map(
      (row) =>
        `<tr>${row.map((c) => `<td style="border:1px solid #ccc;padding:6px 8px;">${String(c).replace(/</g, '&lt;')}</td>`).join('')}</tr>`,
    )
    .join('');
  const header = matrix[0]
    .map((h) => `<th style="border:1px solid #ccc;padding:6px 8px;background:#f5f5f5;">${h}</th>`)
    .join('');

  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head><title>${title}</title></head>
    <body style="font-family:Arial,sans-serif;padding:16px;">
      <h2>${title}</h2>
      <table style="border-collapse:collapse;width:100%;font-size:12px;">
        <thead><tr>${header}</tr></thead>
        <tbody>${htmlRows}</tbody>
      </table>
    </body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
