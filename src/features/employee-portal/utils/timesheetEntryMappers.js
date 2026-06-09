/** Placeholder until project picker is enabled (see commented field in TimesheetInlineEntryRow). */
export const TIMESHEET_PROJECT_PLACEHOLDER = '—';

/**
 * API row → UI display shape.
 */
export function apiEntryToDisplay(entry) {
  const workAreaDescription =
    entry.workAreaDescription ?? entry.taskDescription ?? entry.taskName ?? '';
  return {
    ...entry,
    workAreaDescription,
    categoryId: entry.categoryId,
    categoryName: entry.categoryName ?? entry.category?.name ?? '',
    taskStatus: entry.taskStatus ?? 'IN_PROGRESS',
    priority: entry.priority ?? 'MEDIUM',
    refNumber: entry.refNumber ?? entry.blockerNotes ?? '',
  };
}

/** UI row → API payload. */
export function displayRowToApiPayload(row) {
  const workAreaDescription = String(row.workAreaDescription ?? '').trim();
  const refNumber = String(row.refNumber ?? '').trim();

  return {
    projectName: TIMESHEET_PROJECT_PLACEHOLDER,
    taskName: workAreaDescription.slice(0, 200) || 'Work log',
    taskDescription: workAreaDescription,
    categoryId: row.categoryId,
    hoursSpent: Number(row.hoursSpent),
    taskStatus: row.taskStatus ?? 'IN_PROGRESS',
    priority: row.priority ?? 'MEDIUM',
    blockerNotes: refNumber || undefined,
  };
}

export function serializeEntriesForApi(entries) {
  return entries.map((entry) => {
    const base = displayRowToApiPayload(apiEntryToDisplay(entry));
    if (entry.id) base.id = entry.id;
    return base;
  });
}
