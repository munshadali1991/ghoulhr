/**
 * Pure validators for expense claim editor (field-level error maps).
 */

/**
 * Local calendar date as YYYY-MM-DD.
 * @returns {string}
 */
export function localTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * @param {string} title
 * @returns {{ title?: string }}
 */
export function validateClaimTitle(title) {
  const errors = {};
  if (!title?.trim() || title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  return errors;
}

/**
 * @param {{
 *   categoryId?: string,
 *   expenseDate?: string,
 *   merchant?: string,
 *   description?: string,
 *   amount?: string,
 * }} form
 * @param {File | null} receiptFile
 * @param {{ requireReceipt?: boolean, todayKey?: string }} [options]
 * @returns {{
 *   categoryId?: string,
 *   expenseDate?: string,
 *   merchant?: string,
 *   description?: string,
 *   amount?: string,
 *   receipt?: string,
 * }}
 */
export function validateExpenseLineForm(
  form,
  receiptFile,
  { requireReceipt = true, todayKey = localTodayKey() } = {},
) {
  /** @type {Record<string, string>} */
  const errors = {};

  if (!form.categoryId) {
    errors.categoryId = 'Select a category';
  }
  if (!form.expenseDate) {
    errors.expenseDate = 'Select an expense date';
  } else if (form.expenseDate > todayKey) {
    errors.expenseDate = 'Expense date cannot be in the future';
  }
  if (!form.merchant?.trim() || form.merchant.trim().length < 2) {
    errors.merchant = 'Merchant must be at least 2 characters';
  }
  if (!form.description?.trim() || form.description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters';
  }

  const amountRaw = form.amount?.trim() ?? '';
  const amount = Number(amountRaw);
  if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than zero';
  } else if (
    amountRaw.includes('.') &&
    (amountRaw.split('.')[1] || '').length > 2
  ) {
    errors.amount = 'Amount can have at most 2 decimal places';
  }

  if (requireReceipt && !receiptFile) {
    errors.receipt = 'Receipt is required';
  }

  return errors;
}

/**
 * @param {Array<{ lineNo?: number, expenseDate?: string }>} lines
 * @param {string} [todayKey]
 * @returns {string | null} error message or null
 */
export function findFutureDatedLineMessage(lines, todayKey = localTodayKey()) {
  const future = (lines || []).filter(
    (line) => line.expenseDate && line.expenseDate > todayKey,
  );
  if (!future.length) return null;
  if (future.length === 1) {
    return `Line ${future[0].lineNo} expense date cannot be in the future. Change the date to today or earlier, then submit.`;
  }
  return `${future.length} expenses have future dates. Change those dates to today or earlier, then submit.`;
}

/**
 * @param {Record<string, string>} errors
 * @returns {string | null}
 */
export function firstErrorField(errors) {
  const order = [
    'title',
    'categoryId',
    'expenseDate',
    'merchant',
    'description',
    'amount',
    'receipt',
  ];
  return order.find((key) => errors[key]) ?? null;
}
