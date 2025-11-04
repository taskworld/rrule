import { IterResultType, QueryMethodTypes } from './types'

// =============================================================================
// Results
// =============================================================================

export type IterArgs = {
  inc: boolean
  before: Date
  after: Date
  dt: Date
  skipOptimisation: boolean
  _value: Date | Date[] | null
}

/**
 * This class helps us to emulate python's generators, sorta.
 */
export default class IterResult<M extends QueryMethodTypes> {
  public method: M
  public args: Partial<IterArgs>
  public minDate: Date | null = null
  public maxDate: Date | null = null
  public _result: Date[] = []
  public total = 0

  constructor(method: M, args: Partial<IterArgs>) {
    this.method = method
    this.args = args

    if (method === 'between') {
      this.maxDate = args.inc
        ? args.before
        : new Date(args.before.getTime() - 1)
      this.minDate = args.inc ? args.after : new Date(args.after.getTime() + 1)
    } else if (method === 'before') {
      this.maxDate = args.inc ? args.dt : new Date(args.dt.getTime() - 1)
    } else if (method === 'after') {
      this.minDate = args.inc ? args.dt : new Date(args.dt.getTime() + 1)
    }
  }

  accept(date: Date) {
    ++this.total
    const tooEarly = this.minDate && date < this.minDate
    const tooLate = this.maxDate && date > this.maxDate

    if (this.method === 'between') {
      if (tooEarly) return true
      if (tooLate) return false
    } else if (this.method === 'before') {
      if (tooLate) return false
    } else if (this.method === 'after') {
      if (tooEarly) return true
      this.add(date)
      return false
    }

    return this.add(date)
  }

  add(date: Date) {
    this._result.push(date)
    return true
  }

  getValue(): IterResultType<M> {
    const res = this._result

    switch (this.method) {
      case 'all':
      case 'between':
        return res as IterResultType<M>

      case 'before':
      case 'after':
      default:
        return (res.length ? res[res.length - 1] : null) as IterResultType<M>
    }
  }

  clone() {
    return new IterResult(this.method, this.args)
  }
}
