// =============================================================================
// Helper functions
// =============================================================================

export function isDefined<T>(value?: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function range(start: number, end?: number) {
  if (end === undefined) {
    end = start
    start = 0
  }

  return Array.from({ length: end - start }).map((_, i) => i + start)
}

export function repeat<T>(value: T | T[], length: number) {
  return Array.isArray(value)
    ? Array.from({ length }, () => [...value])
    : Array.from({ length }, () => value)
}

export function toArray<T>(item: T | T[]) {
  return Array.isArray(item) ? item : [item]
}

export function empty<T>(obj: T | T[] | null | undefined) {
  return !isDefined(obj) || (Array.isArray(obj) && obj.length === 0)
}

/**
 * closure/goog/math/math.js:modulo
 * Copyright 2006 The Closure Library Authors.
 * The % operator in JavaScript returns the remainder of a / b, but differs from
 * some other languages in that the result will have the same sign as the
 * dividend. For example, -1 % 8 == -1, whereas in some other languages
 * (such as Python) the result would be 7. This function emulates the more
 * correct modulo behavior, which is useful for certain applications such as
 * calculating an offset index in a circular list.
 *
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @return {number} a % b where the result is between 0 and b (either 0 <= x < b
 * or b < x <= 0, depending on the sign of b).
 */
export function pymod(a: number, b: number) {
  const r = a % b
  // If r and b differ in sign, add b to wrap the result to the correct sign.
  return r * b < 0 ? r + b : r
}

/**
 * @see: <http://docs.python.org/library/functions.html#divmod>
 */
export function divmod(a: number, b: number) {
  return { div: Math.floor(a / b), mod: pymod(a, b) }
}
