/**
 * Get the date parts from a date string
 * @param date
 * @example
 * const date = '2021-12-28'
 * @returns
 * {
 *  year: '2021',
 *  month: 'Dec',
 *  day: '28'
 * }
 */
export const getDateParts = (
  date: string
): { year: string; month: string; day: string } => {
  const dateObject = new globalThis.Date(date)
  const year = dateObject.getUTCFullYear().toString()
  const month = dateObject.toLocaleString('default', { month: 'short' })
  // get the day of the month
  const day = dateObject.getUTCDate().toString()

  return { year, month, day }
}
