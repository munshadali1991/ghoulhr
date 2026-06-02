const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDayOfWeek(isoDate) {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  return DAY_NAMES[d.getUTCDay()];
}

/**
 * @param {Array<{ holidayDate: string, name: string, holidayType: string }>} holidays
 * @param {number} year
 * @returns {Record<number, Array<{ date: string, name: string, dayOfWeek: string, applicationStatus: string }>>}
 */
export function buildHolidayMonths(holidays, year) {
  const months = {};
  for (let m = 0; m < 12; m += 1) {
    months[m] = [];
  }

  for (const h of holidays) {
    const d = new Date(`${h.holidayDate}T12:00:00.000Z`);
    if (d.getUTCFullYear() !== year) continue;
    const monthIndex = d.getUTCMonth();
    months[monthIndex].push({
      date: h.holidayDate,
      name: h.name,
      dayOfWeek: formatDayOfWeek(h.holidayDate),
      applicationStatus: 'none',
    });
  }

  for (let m = 0; m < 12; m += 1) {
    months[m].sort((a, b) => a.date.localeCompare(b.date));
  }

  return months;
}
