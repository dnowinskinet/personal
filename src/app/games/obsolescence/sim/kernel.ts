/**
 * The run loop and replay entry point.
 *
 * `run()` is the executable form of I-004: the same seed and the same command log always produce
 * the same final state. Balance sweeps, regression tests, and bug reproduction all go through here.
 */

import { sortCommandLog, type ScheduledCommand } from './commands';
import { advanceTick, applyCommand } from './reduce';
import { createInitialState, type SimState } from './state';

export interface RunOptions {
  readonly seed: number;
  /** Commands to apply, each on its scheduled tick. Order within a tick is preserved. */
  readonly log?: readonly ScheduledCommand[];
  /** How many ticks to advance. Wall-clock time is never consulted. */
  readonly ticks: number;
}

/**
 * Runs a simulation from scratch and returns the final state.
 *
 * Commands scheduled for tick N are applied *before* tick N advances, so a command scheduled at
 * tick 0 is visible during the first tick. Commands scheduled beyond `ticks` are ignored rather
 * than silently applied at the end.
 */
export function run(options: RunOptions): SimState {
  const { seed, ticks } = options;
  const log = sortCommandLog(options.log ?? []);

  let state = createInitialState(seed);
  let cursor = 0;

  for (let tick = 0; tick < ticks; tick += 1) {
    while (cursor < log.length && log[cursor].tick <= tick) {
      state = applyCommand(state, log[cursor].command);
      cursor += 1;
    }
    state = advanceTick(state);
  }

  return state;
}

/**
 * Replays a log against a seed and checks it reproduces an expected state.
 *
 * Returns a structured result rather than throwing, so callers can report which field diverged.
 */
export function verifyReplay(
  options: RunOptions,
  expected: SimState
): { readonly matches: boolean; readonly actual: SimState } {
  const actual = run(options);
  return { matches: serialize(actual) === serialize(expected), actual };
}

/**
 * Canonical serialization.
 *
 * Object keys are emitted in sorted order so that two structurally identical states always produce
 * byte-identical output. Without this, replay comparison would depend on property insertion order.
 */
export function serialize(state: SimState): string {
  return JSON.stringify(sortKeysDeep(state));
}

/** Parses canonical serialization. Throws on malformed input — callers decide the recovery policy. */
export function deserialize(payload: string): SimState {
  return JSON.parse(payload) as SimState;
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    sorted[key] = sortKeysDeep(source[key]);
  }
  return sorted;
}
