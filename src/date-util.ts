import { Time } from './datetime'

type Datelike = Pick<Date, 'getTime'>

export function datetime(
  y: number,
  m: number,
  d: number,
  h = 0,
  i = 0,
  s = 0,
  ms = 0,
) {
  return new Date(Date.UTC(y, m - 1, d, h, i, s, ms))
}

export function sort<T extends Datelike>(dates: T[]) {
  dates.sort((a, b) => a.getTime() - b.getTime())
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

export function clone(date: Date | Time) {
  return new Date(date.getTime())
}

// ---

export const MAX_YEAR = 9999

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// ---

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function getDaysInMonth(date: Date) {
  const month = date.getUTCMonth()
  return month === 1 && isLeapYear(date.getUTCFullYear())
    ? 29
    : MONTH_DAYS[month]
}

// http://docs.python.org/library/calendar.html#calendar.monthrange
export function monthRange(year: number, month: number) {
  const date = new Date(Date.UTC(year, month, 1))
  return [getWeekday(date), getDaysInMonth(date)]
}

// ---

const ONE_DAY = 1000 * 60 * 60 * 24

// Python: MO-SU: 0 - 6 vs JS: SU-SAT 0 - 6
const PY_WEEKDAYS = [6, 0, 1, 2, 3, 4, 5]

export function getWeekday(date: Date) {
  return PY_WEEKDAYS[date.getUTCDay()]
}

export function differenceInDays(date1: Date, date2: Date) {
  return Math.round((date1.getTime() - date2.getTime()) / ONE_DAY)
}

// ---

/**
 * Python uses 1-Jan-1 as the base for calculating ordinals but we don't
 * want to confuse the JS engine with milliseconds > Number.MAX_NUMBER,
 * therefore we use 1-Jan-1970 instead
 */
export const ORDINAL_BASE = datetime(1970, 1, 1)

export function fromOrdinal(ordinal: number) {
  return new Date(ORDINAL_BASE.getTime() + ordinal * ONE_DAY)
}

export function toOrdinal(date: Date) {
  return differenceInDays(date, ORDINAL_BASE)
}

// ---

export function combine(date: Date, time: Date | Time = date) {
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

// ---

export function untilTimeToString(time: number, utc = true) {
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

const re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/

export function untilStringToDate(until: string) {
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

// ---

// date format for sv-SE is almost ISO8601
function dateTZtoISO8601(date: Date, timeZone: string) {
  return `${date.toLocaleString('sv-SE', { timeZone }).replace(' ', 'T')}Z`
}

export function dateInTimeZone(date: Date, timeZone: string) {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Date constructor can only reliably parse dates in ISO8601 format
  const dateInLocalTZ = new Date(dateTZtoISO8601(date, localTimeZone))
  const dateInTargetTZ = new Date(dateTZtoISO8601(date, timeZone ?? 'UTC'))

  const tzOffset = dateInTargetTZ.getTime() - dateInLocalTZ.getTime()
  return new Date(date.getTime() - tzOffset)
}
