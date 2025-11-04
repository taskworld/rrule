import { combine, fromOrdinal, MAX_YEAR } from '../date-util'
import { DateWithZone } from '../date-with-zone'
import { DateTime, Time } from '../datetime'
import { empty, isDefined } from '../helpers'
import Iterinfo from '../iter-info/index'
import IterResult from '../iter-result'
import { buildTimeset } from '../parse-options'
import { RRule } from '../rrule'
import { freqIsDailyOrGreater, ParsedOptions, QueryMethodTypes } from '../types'
import { buildPosList } from './build-pos-list'

export function iter<M extends QueryMethodTypes>(
  iterResult: IterResult<M>,
  parsedOptions: ParsedOptions,
) {
  const { freq, dtstart, interval, until, bysetpos } = parsedOptions

  let count = parsedOptions.count
  if (count === 0 || interval === 0) {
    return emitResult(iterResult)
  }

  const counterDate = DateTime.fromDate(dtstart)

  const ii = new Iterinfo(parsedOptions)
  ii.rebuild(counterDate.year, counterDate.month)

  let timeset = makeTimeset(ii, counterDate, parsedOptions)

  for (;;) {
    const [dayset, start, end] = ii.getdayset(freq)(
      counterDate.year,
      counterDate.month,
      counterDate.day,
    )

    const filtered = removeFilteredDays(dayset, start, end, ii, parsedOptions)

    if (!empty(bysetpos)) {
      const poslist = buildPosList(bysetpos, timeset, start, end, ii, dayset)

      for (let j = 0; j < poslist.length; j++) {
        const res = poslist[j]
        if (until && res > until) {
          return emitResult(iterResult)
        }

        if (res >= dtstart) {
          const rezonedDate = rezoneIfNeeded(res, parsedOptions)
          if (!iterResult.accept(rezonedDate)) {
            return emitResult(iterResult)
          }

          if (count) {
            --count
            if (!count) {
              return emitResult(iterResult)
            }
          }
        }
      }
    } else {
      for (let j = start; j < end; j++) {
        const currentDay = dayset[j]
        if (!isDefined(currentDay)) {
          continue
        }

        const date = fromOrdinal(ii.yearordinal + currentDay)
        for (let k = 0; k < timeset.length; k++) {
          const time = timeset[k]
          const res = combine(date, time)
          if (until && res > until) {
            return emitResult(iterResult)
          }

          if (res >= dtstart) {
            const rezonedDate = rezoneIfNeeded(res, parsedOptions)
            if (!iterResult.accept(rezonedDate)) {
              return emitResult(iterResult)
            }

            if (count) {
              --count
              if (!count) {
                return emitResult(iterResult)
              }
            }
          }
        }
      }
    }
    if (parsedOptions.interval === 0) {
      return emitResult(iterResult)
    }

    // Handle frequency and interval
    counterDate.add(parsedOptions, filtered)

    if (counterDate.year > MAX_YEAR) {
      return emitResult(iterResult)
    }

    if (!freqIsDailyOrGreater(freq)) {
      timeset = ii.gettimeset(freq)(
        counterDate.hour,
        counterDate.minute,
        counterDate.second,
        0,
      )
    }

    ii.rebuild(counterDate.year, counterDate.month)
  }
}

function isFiltered(
  ii: Iterinfo,
  currentDay: number,
  options: ParsedOptions,
): boolean {
  const {
    bymonth,
    byweekno,
    byweekday,
    byeaster,
    bymonthday,
    bynmonthday,
    byyearday,
  } = options

  return (
    (!empty(bymonth) && !bymonth.includes(ii.mmask[currentDay])) ||
    (!empty(byweekno) && !ii.wnomask[currentDay]) ||
    (!empty(byweekday) && !byweekday.includes(ii.wdaymask[currentDay])) ||
    (!empty(ii.nwdaymask) && !ii.nwdaymask[currentDay]) ||
    (byeaster !== null && !ii.eastermask.includes(currentDay)) ||
    ((!empty(bymonthday) || !empty(bynmonthday)) &&
      !bymonthday.includes(ii.mdaymask[currentDay]) &&
      !bynmonthday.includes(ii.nmdaymask[currentDay])) ||
    (!empty(byyearday) &&
      ((currentDay < ii.yearlen &&
        !byyearday.includes(currentDay + 1) &&
        !byyearday.includes(-ii.yearlen + currentDay)) ||
        (currentDay >= ii.yearlen &&
          !byyearday.includes(currentDay + 1 - ii.yearlen) &&
          !byyearday.includes(-ii.nextyearlen + currentDay - ii.yearlen))))
  )
}

function rezoneIfNeeded(date: Date, options: ParsedOptions) {
  return new DateWithZone(date, options.tzid).rezonedDate()
}

function emitResult<M extends QueryMethodTypes>(iterResult: IterResult<M>) {
  return iterResult.getValue()
}

function removeFilteredDays(
  dayset: (number | null)[],
  start: number,
  end: number,
  ii: Iterinfo,
  options: ParsedOptions,
) {
  let filtered = false
  for (let dayCounter = start; dayCounter < end; dayCounter++) {
    const currentDay = dayset[dayCounter]

    filtered = isFiltered(ii, currentDay, options)

    if (filtered) dayset[currentDay] = null
  }

  return filtered
}

function makeTimeset(
  ii: Iterinfo,
  counterDate: DateTime,
  options: ParsedOptions,
): Time[] | null {
  const { freq, byhour, byminute, bysecond } = options

  if (freqIsDailyOrGreater(freq)) {
    return buildTimeset(options)
  }

  if (
    (freq >= RRule.HOURLY &&
      !empty(byhour) &&
      !byhour.includes(counterDate.hour)) ||
    (freq >= RRule.MINUTELY &&
      !empty(byminute) &&
      !byminute.includes(counterDate.minute)) ||
    (freq >= RRule.SECONDLY &&
      !empty(bysecond) &&
      !bysecond.includes(counterDate.second))
  ) {
    return []
  }

  return ii.gettimeset(freq)(
    counterDate.hour,
    counterDate.minute,
    counterDate.second,
    counterDate.millisecond,
  )
}
