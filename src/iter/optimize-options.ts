import { DateTime } from 'luxon'

import { empty } from '../helpers'
import IterResult from '../iter-result'
import { Frequency, Options, ParsedOptions, QueryMethodTypes } from '../types'
import { Weekday } from '../weekday'

const UNIT_BY_FREQUENCY = {
  [Frequency.YEARLY]: 'year',
  [Frequency.MONTHLY]: 'month',
  [Frequency.WEEKLY]: 'week',
  [Frequency.DAILY]: 'day',
  [Frequency.HOURLY]: 'hour',
  [Frequency.MINUTELY]: 'minute',
  [Frequency.SECONDLY]: 'second',
} as const

function optimize(
  frequency: Frequency,
  dtstart: Date,
  interval: number,
  minDate?: Date,
  maxDate?: Date,
  count?: number,
  exdateHash?: { [k: number]: boolean },
  evalExdate?: (after: Date, before: Date) => void,
) {
  const frequencyUnit = UNIT_BY_FREQUENCY[frequency]
  const minDateTime = DateTime.fromJSDate(minDate ? minDate : maxDate, {
    zone: 'UTC',
  })
  const dtstartDateTime = DateTime.fromJSDate(dtstart, { zone: 'UTC' })

  const diff = Math.abs(
    dtstartDateTime.diff(minDateTime, frequencyUnit).get(frequencyUnit),
  )
  const intervalsInDiff = Math.floor(diff / interval)

  let optimisedDtstart = dtstartDateTime.plus({
    [frequencyUnit]: interval * intervalsInDiff,
  })

  let decrementCountFor = intervalsInDiff

  if (evalExdate) {
    evalExdate(
      optimisedDtstart.minus({ millisecond: 1 }).toJSDate(),
      optimisedDtstart.plus({ millisecond: 1 }).toJSDate(),
    )
  }

  while (exdateHash?.[optimisedDtstart.toMillis()]) {
    optimisedDtstart = optimisedDtstart.minus({ [frequencyUnit]: interval })
    decrementCountFor--
  }

  if (count !== undefined) {
    count = count - decrementCountFor
    count = count < 0 ? 0 : count
  }

  return {
    dtstart: optimisedDtstart.toJSDate(),
    count,
  }
}

export function optimizeOptions<M extends QueryMethodTypes>(
  iterResult: IterResult<M>,
  parsedOptions: ParsedOptions,
  origOptions: Partial<Options>,
  exdateHash?: { [k: number]: boolean },
  evalExdate?: (after: Date, before: Date) => void,
) {
  const {
    freq,
    count,
    bymonth,
    bysetpos,
    bymonthday,
    byyearday,
    byweekno,
    byhour,
    byminute,
    bysecond,
    byweekday,
    byeaster,
    interval = 1,
  } = origOptions
  const { minDate, maxDate, method, args } = iterResult
  const { dtstart } = parsedOptions
  const { skipOptimisation } = args

  if (
    skipOptimisation ||
    method === 'all' ||
    (!minDate && !maxDate) ||
    (minDate && minDate <= dtstart) ||
    (maxDate && maxDate <= dtstart) ||
    !empty(bymonth) ||
    !empty(bysetpos) ||
    !empty(bymonthday) ||
    !empty(byyearday) ||
    !empty(byweekno) ||
    !empty(byhour) ||
    !empty(byminute) ||
    !empty(bysecond) ||
    !empty(bysecond) ||
    !empty(byeaster) ||
    (!empty(byweekday) &&
      [].concat(byweekday).some((w) => w instanceof Weekday))
  ) {
    return parsedOptions
  }

  return {
    ...parsedOptions,
    ...optimize(
      freq,
      dtstart,
      interval,
      minDate,
      maxDate,
      count,
      exdateHash,
      evalExdate,
    ),
  }
}
