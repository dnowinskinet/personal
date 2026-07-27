/**
 * Authoritative simulation clock.
 *
 * Enforces I-005: the tick is 10 Hz and rendering never advances state. Nothing in `sim/` may read
 * wall-clock time — a tick count is the only notion of time the simulation has.
 */

/** Authoritative ticks per second. */
export const TICK_HZ = 10;

/** Milliseconds of simulated time per tick. */
export const TICK_MS = 1000 / TICK_HZ;

/**
 * Simulated milliseconds elapsed at a given tick.
 *
 * This is derived, not measured. Two runs that reach tick N have elapsed exactly the same
 * simulated time regardless of how long they took in the real world.
 */
export function simulatedMsAt(tick: number): number {
  return tick * TICK_MS;
}

/**
 * Ticks required to cover a span of simulated milliseconds, rounded up.
 *
 * Used by content authors who want to express a duration in human terms ("about 3 seconds") without
 * hard-coding tick counts.
 */
export function ticksForMs(milliseconds: number): number {
  return Math.ceil(milliseconds / TICK_MS);
}
