import dayjs from 'dayjs';

/**
 * @param {import('dayjs').Dayjs | string | Date} date
 */
export function toDateKey(date) {
  return dayjs(date).format('YYYY-MM-DD');
}
