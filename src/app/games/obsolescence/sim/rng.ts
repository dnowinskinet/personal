/**
 * Deterministic seeded randomness.
 *
 * Enforces I-006: `Math.random` is forbidden inside `sim/`. Every random value is a pure function
 * of `(seed, cursor)`, which means it is reproducible, serializable as two integers, and replayable
 * without storing a generator's internal state.
 *
 * The algorithm is mulberry32 — small, fast, and good enough for game randomness. It is not
 * cryptographically secure and must never be used as if it were.
 */

/**
 * Returns the value at a position in the sequence for a seed.
 *
 * Pure: the same `(seed, cursor)` always yields the same number in `[0, 1)`. Callers advance the
 * cursor themselves, which keeps the generator stateless and the simulation state small.
 */
export function randomAt(seed: number, cursor: number): number {
  let state = (seed + Math.imul(cursor, 0x6d2b79f5)) >>> 0;
  state = (state + 0x6d2b79f5) >>> 0;
  let mixed = state;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
}

/** Integer in `[minInclusive, maxExclusive)` drawn from the sequence position. */
export function randomIntAt(
  seed: number,
  cursor: number,
  minInclusive: number,
  maxExclusive: number
): number {
  const span = maxExclusive - minInclusive;
  if (span <= 0) {
    return minInclusive;
  }
  return minInclusive + Math.floor(randomAt(seed, cursor) * span);
}

/**
 * Picks an element from a non-empty list.
 *
 * Returns `undefined` only when the list is empty, so callers must handle that case explicitly
 * rather than receiving a silently wrong element.
 */
export function pickAt<T>(seed: number, cursor: number, items: readonly T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return items[randomIntAt(seed, cursor, 0, items.length)];
}
