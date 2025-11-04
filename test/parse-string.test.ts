import { datetime } from '../src/date-util'
import { parseString } from '../src/parse-string'
import { RRule } from '../src/rrule'
import { Frequency, Options } from '../src/types'

describe('parseString', () => {
  it.each([
    [
      'FREQ=WEEKLY;UNTIL=20100101T000000Z',
      { freq: RRule.WEEKLY, until: datetime(2010, 1, 1, 0, 0, 0) },
    ],

    // Parse also `date` but return `date-time`
    [
      'FREQ=WEEKLY;UNTIL=20100101',
      { freq: RRule.WEEKLY, until: datetime(2010, 1, 1, 0, 0, 0) },
    ],
    [
      'DTSTART;TZID=America/New_York:19970902T090000',
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        tzid: 'America/New_York',
      },
    ],
    [
      'RRULE:DTSTART;TZID=America/New_York:19970902T090000',
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        tzid: 'America/New_York',
      },
    ],
  ])(
    'parses valid single lines of rrules',
    function (input: string, expected: Partial<Options>) {
      expect(parseString(input)).toEqual(expected)
    },
  )

  it.each([
    [
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=20100101T000000Z',
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        tzid: 'America/New_York',
        freq: RRule.WEEKLY,
        until: datetime(2010, 1, 1, 0, 0, 0),
      },
    ],
    [
      'DTSTART:19970902T090000Z\n' + 'RRULE:FREQ=YEARLY;COUNT=3\n',
      {
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        freq: RRule.YEARLY,
        count: 3,
      },
    ],
  ])('parses multiline rules', (input: string, expected: Partial<Options>) => {
    expect(parseString(input)).toEqual(expected)
  })

  it.each([
    [
      'RRULE:FREQ=WEEKLY;DTSTART;TZID=America/New_York:19970902T090000',
      {
        freq: Frequency.WEEKLY,
        dtstart: datetime(1997, 9, 2, 9, 0, 0),
        tzid: 'America/New_York',
      },
    ],
  ])(
    'parses legacy dtstart in rrule',
    (input: string, expected: Partial<Options>) => {
      expect(parseString(input)).toEqual(expected)
    },
  )
})
