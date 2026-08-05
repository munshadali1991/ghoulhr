/**
 * @param {{ id?: string | null, employeeId: string, workDate: string }} row
 */
export function getTeamTimesheetRowKey(row) {
  return row.id ?? `placeholder:${row.employeeId}:${row.workDate}`;
}

/**
 * @param {string} rowKey
 */
export function isPlaceholderRowKey(rowKey) {
  return rowKey.startsWith('placeholder:');
}
