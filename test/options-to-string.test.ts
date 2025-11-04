import { datetime } from '../src/date-util'
import { optionsToString } from '../src/options-to-string'
import { RRule } from '../src/rrule'
import { Options } from '../src/types'

describe('optionsToString', () => {
  it.each([
    [
      { freq: RRule.WEEKLY, until: datetime(2010, 1, 1, 0, 0, 0) },
      'RRULE:FREQ=WEEKLY;UNTIL=20100101T000000Z',
    ],
    [
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        tzid: 'America/New_York',
      },
      'DTSTART;TZID=America/New_York:19970902T090000',
    ],
    [
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        freq: RRule.WEEKLY,
      },
      'DTSTART:19970902T090000Z\n' + 'RRULE:FREQ=WEEKLY',
    ],
    [
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        tzid: 'America/New_York',
        freq: RRule.WEEKLY,
      },
      'DTSTART;TZID=America/New_York:19970902T090000\n' + 'RRULE:FREQ=WEEKLY',
    ],
  ])(
    'serializes valid single lines of rrules',
    function (options: Partial<Options>, expected: string) {
      expect(optionsToString(options)).toEqual(expected)
    },
  )
})
