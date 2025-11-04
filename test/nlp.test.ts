import { datetime } from '../src/date-util'
import { DateFormatter } from '../src/nlp/to-text'
import { optionsToString } from '../src/options-to-string'
import { RRule } from '../src/rrule'

const fromTexts = [
  ['RRULE:FREQ=DAILY', 'Every day'],
  ['RRULE:FREQ=DAILY;BYHOUR=10,12,17', 'Every day at 10, 12 and 17'],
  [
    'RRULE:FREQ=WEEKLY;BYDAY=SU;BYHOUR=10,12,17',
    'Every week on Sunday at 10, 12 and 17',
  ],
  ['RRULE:FREQ=WEEKLY', 'Every week'],
  ['RRULE:FREQ=HOURLY', 'Every hour'],
  ['RRULE:INTERVAL=4;FREQ=HOURLY', 'Every 4 hours'],
  ['RRULE:FREQ=WEEKLY;BYDAY=TU', 'Every week on Tuesday'],
  ['RRULE:FREQ=WEEKLY;BYDAY=MO,WE', 'Every week on Monday, Wednesday'],
  ['RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', 'Every weekday'],
  ['RRULE:INTERVAL=2;FREQ=WEEKLY', 'Every 2 weeks'],
  ['RRULE:FREQ=MONTHLY', 'Every month'],
  ['RRULE:INTERVAL=6;FREQ=MONTHLY', 'Every 6 months'],
  ['RRULE:FREQ=YEARLY', 'Every year'],
  ['RRULE:FREQ=YEARLY;BYDAY=+1FR', 'Every year on the 1st Friday'],
  ['RRULE:FREQ=YEARLY;BYDAY=+13FR', 'Every year on the 13th Friday'],
  ['RRULE:FREQ=MONTHLY;BYMONTHDAY=4', 'Every month on the 4th'],
  ['RRULE:FREQ=MONTHLY;BYMONTHDAY=-4', 'Every month on the 4th last'],
  ['RRULE:FREQ=MONTHLY;BYDAY=+3TU', 'Every month on the 3rd Tuesday'],
  ['RRULE:FREQ=MONTHLY;BYDAY=-3TU', 'Every month on the 3rd last Tuesday'],
  ['RRULE:FREQ=MONTHLY;BYDAY=-1MO', 'Every month on the last Monday'],
  ['RRULE:FREQ=MONTHLY;BYDAY=-2FR', 'Every month on the 2nd last Friday'],
  // ['Every week until January 1, 2007', 'RRULE:FREQ=WEEKLY;UNTIL=20070101T080000Z'],
  ['RRULE:FREQ=WEEKLY;COUNT=20', 'Every week for 20 times'],
]

const toTexts = [
  ...fromTexts,
  [
    'DTSTART;TZID=America/New_York:20220601T000000\nRRULE:INTERVAL=1;FREQ=WEEKLY;BYDAY=MO',
    'Every week on monday',
  ],
]

describe('NLP', () => {
  it.each(fromTexts)('parseText()', function (rule, text) {
    expect(optionsToString(RRule.parseText(text))).toBe(rule)
  })

  it.each(fromTexts)('fromText()', function (rule, text) {
    expect(RRule.fromText(text).toString()).toBe(rule)
  })

  it.each(toTexts)('toText()', function (rule, text) {
    expect(RRule.fromString(rule).toText().toLowerCase()).toBe(
      text.toLowerCase(),
    )
  })

  it('permits integers in byweekday (#153)', () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: 0,
    })

    expect(rrule.toText()).toBe('every week on Monday')
    expect(rrule.toString()).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO')
  })

  it('sorts monthdays correctly (#101)', () => {
    const rule = new RRule({ freq: 2, bymonthday: [3, 10, 17, 24] })
    expect(rule.toText()).toBe('every week on the 3rd, 10th, 17th and 24th')
  })

  it('shows correct text for every day', () => {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [
        RRule.MO,
        RRule.TU,
        RRule.WE,
        RRule.TH,
        RRule.FR,
        RRule.SA,
        RRule.SU,
      ],
    })

    expect(rule.toText()).toBe('every day')
  })

  it('shows correct text for every minute', () => {
    const rule = new RRule({ freq: RRule.MINUTELY })
    expect(rule.toText()).toBe('every minute')
  })

  it('shows correct text for every (plural) minutes', () => {
    const rule = new RRule({ freq: RRule.MINUTELY, interval: 2 })
    expect(rule.toText()).toBe('every 2 minutes')
  })

  it("by default formats 'until' correctly", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      until: datetime(2012, 11, 10),
    })

    expect(rrule.toText()).toBe('every week until November 10, 2012')
  })

  it("formats 'until' as desired if asked", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      until: datetime(2012, 11, 10),
    })

    const dateFormatter: DateFormatter = (year, month, day) =>
      `${day}. ${month}, ${year}`

    expect(rrule.toText({ dateFormatter })).toBe(
      'every week until 10. November, 2012',
    )
  })
})
