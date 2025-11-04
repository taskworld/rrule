import { Time } from './datetime'

type Datelike = Pick<Date, 'getTime'>

export function datetime(y: number, m: number, d: number, h = 0, i = 0, s = 0) {
  return new Date(Date.UTC(y, m - 1, d, h, i, s))
}

/**
 * General date-related utilities.
 * Also handles several incompatibilities between JavaScript and Python
 *
 */
export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Number of milliseconds of one day
 */
export const ONE_DAY = 1000 * 60 * 60 * 24

/**
 * @see: <http://docs.python.org/library/datetime.html#datetime.MAXYEAR>
 */
export const MAXYEAR = 9999

/**
 * Python uses 1-Jan-1 as the base for calculating ordinals but we don't
 * want to confuse the JS engine with milliseconds > Number.MAX_NUMBER,
 * therefore we use 1-Jan-1970 instead
 */
export const ORDINAL_BASE = datetime(1970, 1, 1)

/**
 * Python: MO-SU: 0 - 6
 * JS: SU-SAT 0 - 6
 */
export const PY_WEEKDAYS = [6, 0, 1, 2, 3, 4, 5]

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * @see: <http://www.mcfedries.com/JavaScript/DaysBetween.asp>
 */
export function daysBetween(date1: Date, date2: Date) {
  // The number of milliseconds in one day
  // Convert both dates to milliseconds
  const date1ms = date1.getTime()
  const date2ms = date2.getTime()

  // Calculate the difference in milliseconds
  const differencems = date1ms - date2ms

  // Convert back to days and return
  return Math.round(differencems / ONE_DAY)
}

/**
 * @see: <http://docs.python.org/library/datetime.html#datetime.date.toordinal>
 */
export function toOrdinal(date: Date) {
  return daysBetween(date, ORDINAL_BASE)
}

/**
 * @see - <http://docs.python.org/library/datetime.html#datetime.date.fromordinal>
 */
export function fromOrdinal(ordinal: number) {
  return new Date(ORDINAL_BASE.getTime() + ordinal * ONE_DAY)
}

export function getMonthDays(date: Date) {
  const month = date.getUTCMonth()
  return month === 1 && isLeapYear(date.getUTCFullYear())
    ? 29
    : MONTH_DAYS[month]
}

/**
 * @return {Number} python-like weekday
 */
export function getWeekday(date: Date) {
  return PY_WEEKDAYS[date.getUTCDay()]
}

/**
 * @see: <http://docs.python.org/library/calendar.html#calendar.monthrange>
 */
export function monthRange(year: number, month: number) {
  const date = datetime(year, month + 1, 1)
  return [getWeekday(date), getMonthDays(date)]
}

/**
 * @see: <http://docs.python.org/library/datetime.html#datetime.datetime.combine>
 */
export function combine(date: Date, time: Date | Time) {
  time = time || date
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds(),
    ),
  )
}

export function clone(date: Date | Time) {
  return new Date(date.getTime())
}

export function cloneDates(dates: Date[] | Time[]) {
  const clones = []
  for (let i = 0; i < dates.length; i++) {
    clones.push(clone(dates[i]))
  }
  return clones
}

/**
 * Sorts an array of Date or Time objects
 */
export function sort<T extends Datelike>(dates: T[]) {
  dates.sort(function (a, b) {
    return a.getTime() - b.getTime()
  })
}

export function timeToUntilString(time: number, utc = true) {
  const date = new Date(time)
  return [
    `${date.getUTCFullYear()}`.padStart(4, '0'),
    `${date.getUTCMonth() + 1}`.padStart(2, '0'),
    `${date.getUTCDate()}`.padStart(2, '0'),
    'T',
    `${date.getUTCHours()}`.padStart(2, '0'),
    `${date.getUTCMinutes()}`.padStart(2, '0'),
    `${date.getUTCSeconds()}`.padStart(2, '0'),
    utc ? 'Z' : '',
  ].join('')
}

export function untilStringToDate(until: string) {
  const re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/
  const bits = re.exec(until)

  if (!bits) throw new Error(`Invalid UNTIL value: ${until}`)

  return new Date(
    Date.UTC(
      parseInt(bits[1], 10),
      parseInt(bits[2], 10) - 1,
      parseInt(bits[3], 10),
      parseInt(bits[5], 10) || 0,
      parseInt(bits[6], 10) || 0,
      parseInt(bits[7], 10) || 0,
    ),
  )
}

const dateTZtoISO8601 = function (date: Date, timeZone: string) {
  // date format for sv-SE is almost ISO8601
  const dateStr = date.toLocaleString('sv-SE', { timeZone })
  // '2023-02-07 10:41:36'
  return dateStr.replace(' ', 'T') + 'Z'
}

export function dateInTimeZone(date: Date, timeZone: string) {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  // Date constructor can only reliably parse dates in ISO8601 format
  const dateInLocalTZ = new Date(dateTZtoISO8601(date, localTimeZone))
  const dateInTargetTZ = new Date(dateTZtoISO8601(date, timeZone ?? 'UTC'))
  const tzOffset = dateInTargetTZ.getTime() - dateInLocalTZ.getTime()

  return new Date(date.getTime() - tzOffset)
}
