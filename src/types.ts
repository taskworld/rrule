import { Weekday, WeekdayStr } from './weekday'

export type QueryMethods = {
  all(): Date[]
  between(after: Date, before: Date, inc: boolean): Date[]
  before(date: Date, inc: boolean): Date | null
  after(date: Date, inc: boolean): Date | null
}

export type QueryMethodTypes = keyof QueryMethods
export type IterResultType<M extends QueryMethodTypes> = M extends
  | 'all'
  | 'between'
  ? Date[]
  : Date | null

export enum Frequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6,
}

export function freqIsDailyOrGreater(
  freq: Frequency,
): freq is
  | Frequency.YEARLY
  | Frequency.MONTHLY
  | Frequency.WEEKLY
  | Frequency.DAILY {
  return freq < Frequency.HOURLY
}

export type Options = {
  freq: Frequency
  dtstart?: Date
  interval: number
  wkst?: Weekday | number
  count?: number
  until?: Date
  tzid?: string
  bysetpos?: number | number[]
  bymonth?: number | number[]
  bymonthday?: number | number[]
  bynmonthday?: number[]
  byyearday?: number | number[]
  byweekno?: number | number[]
  byweekday?: ByWeekday | ByWeekday[]
  bynweekday?: number[][]
  byhour?: number | number[]
  byminute?: number | number[]
  bysecond?: number | number[]
  byeaster?: number
}

export interface ParsedOptions extends Options {
  dtstart: Date
  wkst: number
  bysetpos: number[]
  bymonth: number[]
  bymonthday: number[]
  bynmonthday: number[]
  byyearday: number[]
  byweekno: number[]
  byweekday: number[]
  byhour: number[]
  byminute: number[]
  bysecond: number[]
}

export type ByWeekday = Weekday | WeekdayStr | number
