import { divmod, empty, isDefined, pymod, range, repeat } from '../src/helpers'
import { isNumber } from './lib/utils'

describe('isDefined', () => {
  it('is false if object is null', () => {
    expect(isDefined(null)).toBe(false)
  })

  it('is false if object is undefined', () => {
    expect(isDefined(undefined)).toBe(false)
  })

  it.each([0, '', 'foo', 123, []])(
    'is true if object is non-null and not undefined',
    (val) => {
      expect(isDefined(val)).toBe(true)
    },
  )
})

describe('isNumber', () => {
  it('is true if it is a number', () => {
    expect(isNumber(0)).toBe(true)
  })

  it('is false if it is not a number', () => {
    expect(isNumber('1')).toBe(false)
    expect(isNumber(null)).toBe(false)
  })
})

describe('empty', () => {
  it('is empty if object is null', () => {
    expect(empty(null)).toBe(true)
  })

  it('is empty if object is undefined', () => {
    expect(empty(undefined)).toBe(true)
  })

  it('is empty if object is an empty array', () => {
    expect(empty([])).toBe(true)
  })

  it('is not empty if object is a non-empty array', () => {
    expect(empty(['foo'])).toBe(false)
    expect(empty([0])).toBe(false)
  })
})

describe('pymod', () => {
  it('returns the wrapped result', () => {
    expect(pymod(1, 8)).toBe(1)
    expect(pymod(-1, -8)).toBe(-1)
    expect(pymod(-1, 8)).toBe(7)
  })
})

describe('divmod', () => {
  it('returns the divided result', () => {
    expect(divmod(1, 8)).toEqual({ div: 0, mod: 1 })
    expect(divmod(-1, -8)).toEqual({ div: 0, mod: -1 })
    expect(divmod(-1, 8)).toEqual({ div: -1, mod: 7 })
  })
})

describe('range', () => {
  it('generates a range', () => {
    expect(range(3, 7)).toEqual([3, 4, 5, 6])
  })

  it('generates to the first argument if no second argument is given', () => {
    expect(range(7)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('repeat', () => {
  it('repeats a single item', () => {
    expect(repeat('foo', 3)).toEqual(['foo', 'foo', 'foo'])
  })

  it('repeats an array', () => {
    expect(repeat(['foo'], 3)).toEqual([['foo'], ['foo'], ['foo']])
  })
})
