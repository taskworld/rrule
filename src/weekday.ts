// =============================================================================
// Weekday
// =============================================================================

export const ALL_WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const

export type WeekdayStr = (typeof ALL_WEEKDAYS)[number]

export class Weekday {
  public weekday: number
  public n?: number

  static fromStr(str: WeekdayStr) {
    return new Weekday(ALL_WEEKDAYS.indexOf(str))
  }

  constructor(weekday: number, n?: number) {
    if (n === 0) {
      throw new Error("Can't create weekday with n == 0")
    }

    this.weekday = weekday
    this.n = n
  }

  equals(other: Weekday) {
    return this.weekday === other.weekday && this.n === other.n
  }

  getJsWeekday() {
    return this.weekday === 6 ? 0 : this.weekday + 1
  }

  nth(n: number) {
    return this.n === n ? this : new Weekday(this.weekday, n)
  }

  toString() {
    const count = this.n ? `${this.n > 0 ? '+' : ''}${this.n}` : ''

    return `${count}${ALL_WEEKDAYS[this.weekday]}`
  }
}
