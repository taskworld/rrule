import { datetime } from '../src/date-util'
import { Days, RRule } from '../src/rrule'
import { RRuleSet } from '../src/rruleset'
import { parseInput, rrulestr } from '../src/rrulestr'
import { Frequency } from '../src/types'
import { ALSO_TEST, parse, testRecurring } from './lib/utils'

describe('rrulestr', function () {
  beforeAll(() => {
    // Enable additional toString() / fromString() tests
    // for each testRecurring().
    ALSO_TEST.STRING_FUNCTIONS = false

    // Enable additional toText() / fromText() tests
    // for each testRecurring().
    // Many of the tests fail because the conversion is only approximate,
    // but it gives an idea about how well or bad it converts.
    ALSO_TEST.NLP_FUNCTIONS = false

    // Thorough after()/before()/between() tests.
    // NOTE: can take a longer time.
    ALSO_TEST.BEFORE_AFTER_BETWEEN = true

    ALSO_TEST.SUBSECOND_PRECISION = false
  })

  const basicRule = [
    'DTSTART:19970902T090000Z',
    'RRULE:FREQ=YEARLY;COUNT=3',
  ].join('\n')

  it('parses an rrule', () => {
    expect(rrulestr(basicRule)).toBeInstanceOf(RRule)
  })

  it('parses an rruleset when forceset=true', () => {
    expect(rrulestr(basicRule, { forceset: true })).toBeInstanceOf(RRuleSet)
  })

  it('parses an rrule without frequency', () => {
    const rRuleString = 'DTSTART:19970902T090000Z'

    const parsedRRule = rrulestr(rRuleString)
    expect(parsedRRule.toString()).toBe(rRuleString)

    const parsedRRuleSet = rrulestr(rRuleString, { forceset: true })
    expect(parsedRRuleSet.toString()).toBe(rRuleString)
  })

  it('parses an rruleset when there are multiple rrules', () => {
    expect(
      rrulestr(
        'DTSTART:19970902T090000Z\n' +
          'RRULE:FREQ=YEARLY;COUNT=2;BYDAY=TU\n' +
          'RRULE:FREQ=YEARLY;COUNT=1;BYDAY=TH\n',
      ),
    ).toBeInstanceOf(RRuleSet)
  })

  testRecurring('testStr', rrulestr(basicRule), [
    datetime(1997, 9, 2, 9, 0),
    datetime(1998, 9, 2, 9, 0),
    datetime(1999, 9, 2, 9, 0),
  ])

  testRecurring(
    'testStrCase',
    rrulestr('dtstart:19970902T090000Z rrule:freq=yearly;count=3'),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
    ],
  )

  testRecurring(
    'testStrSpaces',
    rrulestr(' DTSTART:19970902T090000Z  RRULE:FREQ=YEARLY;COUNT=3 '),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
    ],
  )

  testRecurring(
    'testStrSpacesAndLines',
    rrulestr(
      [' DTSTART:19970902T090000Z ', '', ' RRULE:FREQ=YEARLY;COUNT=3 '].join(
        '\n',
      ),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
    ],
  )

  testRecurring(
    'testStrNoDTStart',
    rrulestr('RRULE:FREQ=YEARLY;COUNT=3', {
      dtstart: parse('19970902T090000'),
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
    ],
  )

  testRecurring(
    'testStrValueOnly',
    rrulestr('FREQ=YEARLY;COUNT=3', {
      dtstart: parse('19970902T090000'),
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
    ],
  )

  testRecurring(
    'testStrUnfold',
    rrulestr(['FREQ=YEA', ' RLY;COUNT=3'].join('\n'), {
      unfold: true,
      dtstart: parse('19970902T090000'),
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
    ],
  )

  testRecurring(
    'testStrSet',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RRULE:FREQ=YEARLY;COUNT=2;BYDAY=TU',
        'RRULE:FREQ=YEARLY;COUNT=1;BYDAY=TH',
      ].join('\n'),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0),
    ],
  )

  testRecurring(
    'testStrSetDate',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RRULE:FREQ=YEARLY;COUNT=1;BYDAY=TU',
        'RDATE:19970904T090000Z',
        'RDATE:19970909T090000Z',
      ].join('\n'),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0),
    ],
  )

  testRecurring(
    'testStrSetExRule',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RRULE:FREQ=YEARLY;COUNT=6;BYDAY=TU,TH',
        'EXRULE:FREQ=YEARLY;COUNT=3;BYDAY=TH',
      ].join('\n'),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 9, 9, 0),
      datetime(1997, 9, 16, 9, 0),
    ],
  )

  testRecurring(
    'testStrSetExDate',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RRULE:FREQ=YEARLY;COUNT=6;BYDAY=TU,TH',
        'EXDATE:19970904T090000Z',
        'EXDATE:19970911T090000Z',
        'EXDATE:19970918T090000Z',
      ].join('\n'),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 9, 9, 0),
      datetime(1997, 9, 16, 9, 0),
    ],
  )

  testRecurring(
    'testStrSetDateAndExDate',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RDATE:19970902T090000Z',
        'RDATE:19970904T090000Z',
        'RDATE:19970909T090000Z',
        'RDATE:19970911T090000Z',
        'RDATE:19970916T090000Z',
        'RDATE:19970918T090000Z',
        'EXDATE:19970904T090000Z',
        'EXDATE:19970911T090000Z',
        'EXDATE:19970918T090000Z',
      ].join('\n'),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 9, 9, 0),
      datetime(1997, 9, 16, 9, 0),
    ],
  )

  testRecurring(
    'testStrSetDateAndExRule',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RDATE:19970902T090000Z',
        'RDATE:19970904T090000Z',
        'RDATE:19970909T090000Z',
        'RDATE:19970911T090000Z',
        'RDATE:19970916T090000Z',
        'RDATE:19970918T090000Z',
        'EXRULE:FREQ=YEARLY;COUNT=3;BYDAY=TH',
      ].join('\n'),
    ),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 9, 9, 0),
      datetime(1997, 9, 16, 9, 0),
    ],
  )

  testRecurring(
    'testStrKeywords',
    rrulestr(
      [
        'DTSTART:19970902T030000Z',
        'RRULE:FREQ=YEARLY;COUNT=3;INTERVAL=3;BYMONTH=3;byweekday=TH;BYMONTHDAY=3;BYHOUR=3;BYMINUTE=3;BYSECOND=3',
      ].join('\n'),
    ),
    [
      datetime(2033, 3, 3, 3, 3, 3),
      datetime(2039, 3, 3, 3, 3, 3),
      datetime(2072, 3, 3, 3, 3, 3),
    ],
  )

  testRecurring(
    'testStrNWeekDay',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RRULE:FREQ=YEARLY;COUNT=3;BYDAY=1TU,-1TH',
      ].join('\n'),
    ),
    [
      datetime(1997, 12, 25, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 12, 31, 9, 0),
    ],
  )

  testRecurring(
    'testStrNWeekDayLarge',
    rrulestr(
      [
        'DTSTART:19970902T090000Z',
        'RRULE:FREQ=YEARLY;COUNT=3;BYDAY=13TU,-13TH',
      ].join('\n'),
    ),
    [
      datetime(1997, 10, 2, 9, 0),
      datetime(1998, 3, 31, 9, 0),
      datetime(1998, 10, 8, 9, 0),
    ],
  )

  it('parses without TZID', () => {
    const rrule = rrulestr(
      ['DTSTART:19970902T090000', 'RRULE:FREQ=WEEKLY'].join('\n'),
    )

    expect(rrule.origOptions).toMatchObject({
      freq: Frequency.WEEKLY,
      dtstart: datetime(1997, 9, 2, 9, 0, 0),
    })
  })

  it('parses TZID', () => {
    const rrule = rrulestr(
      [
        'DTSTART;TZID=America/New_York:19970902T090000',
        'RRULE:FREQ=DAILY;UNTIL=19980902T090000',
      ].join('\n'),
    )

    expect(rrule.origOptions).toMatchObject({
      tzid: 'America/New_York',
      freq: Frequency.DAILY,
      dtstart: datetime(1997, 9, 2, 9, 0, 0),
      until: datetime(1998, 9, 2, 9, 0, 0),
    })
  })

  it('parses a DTSTART inside an RRULE', () => {
    const rrule = rrulestr(
      'RRULE:UNTIL=19990404T110000Z;DTSTART=19990104T110000Z;FREQ=WEEKLY;BYDAY=TU,WE',
    )

    expect(rrule.options).toMatchObject({
      until: datetime(1999, 4, 4, 11, 0, 0),
      dtstart: datetime(1999, 1, 4, 11, 0, 0),
      freq: Frequency.WEEKLY,
      byweekday: [Days.TU.weekday, Days.WE.weekday],
    })
  })

  it('parses a DTSTART with a TZID inside an RRULE', () => {
    const rrule = rrulestr(
      'RRULE:UNTIL=19990404T110000Z;DTSTART;TZID=America/New_York:19990104T110000Z;FREQ=WEEKLY;BYDAY=TU,WE',
    )

    expect(rrule.options).toMatchObject({
      until: datetime(1999, 4, 4, 11, 0, 0),
      dtstart: datetime(1999, 1, 4, 11, 0, 0),
      freq: Frequency.WEEKLY,
      tzid: 'America/New_York',
      byweekday: [Days.TU.weekday, Days.WE.weekday],
    })
  })

  it('parses a DTSTART if it is the first param', () => {
    const rrule = rrulestr(
      'RRULE:DTSTART;TZID=America/Los_Angeles:20180719T111500;FREQ=DAILY;INTERVAL=1',
    )

    expect(rrule.options).toMatchObject({
      dtstart: datetime(2018, 7, 19, 11, 15, 0),
      freq: Frequency.DAILY,
      interval: 1,
      tzid: 'America/Los_Angeles',
    })
  })

  it('parses an RDATE with no TZID param', () => {
    const input = [
      'DTSTART:20180719T111500Z',
      'RRULE:FREQ=DAILY;INTERVAL=1',
      'RDATE:20180720T111500Z',
      'EXDATE:20180721T111500Z',
    ]

    const rruleset = rrulestr(input.join('\n'))
    expect(rruleset.valueOf()).toEqual(input)
  })

  it('parses an RDATE with a TZID param', () => {
    const input = [
      'DTSTART;TZID=America/Los_Angeles:20180719T111500',
      'RRULE:FREQ=DAILY;INTERVAL=1',
      'RDATE;TZID=America/Los_Angeles:20180720T111500',
      'EXDATE;TZID=America/Los_Angeles:20180721T111500',
    ]

    const rruleset = rrulestr(input.join('\n'))
    expect(rruleset.valueOf()).toEqual(input)
  })
})

describe('parseInput', () => {
  it('parses an input into a structure', () => {
    const output = parseInput(
      [
        'DTSTART;TZID=America/New_York:19970902T090000',
        'RRULE:FREQ=DAILY;UNTIL=19980902T090000;INTERVAL=1',
        'RDATE:19970902T090000Z',
        'RDATE:19970904T090000Z',
        'EXDATE:19970904T090000Z',
        'EXRULE:FREQ=WEEKLY;INTERVAL=2',
      ].join('\n'),
    )

    expect(output).toMatchObject({
      dtstart: datetime(1997, 9, 2, 9, 0, 0),
      tzid: 'America/New_York',
      rrulevals: [
        {
          interval: 1,
          freq: Frequency.DAILY,
          until: datetime(1998, 9, 2, 9, 0, 0),
        },
      ],
      exdatevals: [datetime(1997, 9, 4, 9, 0, 0)],
      rdatevals: [datetime(1997, 9, 2, 9, 0, 0), datetime(1997, 9, 4, 9, 0, 0)],
      exrulevals: [
        {
          interval: 2,
          freq: Frequency.WEEKLY,
        },
      ],
    })
  })
})
