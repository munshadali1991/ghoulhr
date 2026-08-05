const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * @param {string | number | undefined} startMonth 1–12
 * @param {Date} [referenceDate]
 * @returns {{ startYear: number, endYear: number, startMonth: number, endMonth: number }}
 */
export function getFinancialYearRange(startMonth, referenceDate = new Date()) {
  const month = Math.min(12, Math.max(1, Number.parseInt(String(startMonth ?? 4), 10) || 4));
  const refMonth = referenceDate.getMonth() + 1;
  const refYear = referenceDate.getFullYear();

  const startYear = refMonth >= month ? refYear : refYear - 1;
  let endYear = startYear;
  let endMonth = month === 1 ? 12 : month - 1;
  if (month !== 1) {
    endYear = startYear + 1;
  }

  return { startYear, endYear, startMonth: month, endMonth };
}

/**
 * @param {string | number | undefined} startMonth
 * @param {Date} [referenceDate]
 * @returns {string} e.g. "Apr 2025 – Mar 2026"
 */
export function formatFinancialYearLabel(startMonth, referenceDate = new Date()) {
  const { startYear, endYear, startMonth: sm, endMonth } = getFinancialYearRange(
    startMonth,
    referenceDate,
  );
  return `${MONTH_SHORT[sm - 1]} ${startYear} – ${MONTH_SHORT[endMonth - 1]} ${endYear}`;
}

/**
 * @param {string | number | undefined} startMonth
 * @param {Date} [referenceDate]
 * @returns {string} e.g. "1 Apr 2025 – 31 Mar 2026"
 */
export function formatFinancialYearDetailed(startMonth, referenceDate = new Date()) {
  const { startYear, endYear, startMonth: sm, endMonth } = getFinancialYearRange(
    startMonth,
    referenceDate,
  );
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  return `1 ${MONTH_SHORT[sm - 1]} ${startYear} – ${lastDay} ${MONTH_SHORT[endMonth - 1]} ${endYear}`;
}
