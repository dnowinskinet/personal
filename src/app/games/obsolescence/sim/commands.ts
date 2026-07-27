/**
 * Typed commands — the only way state changes.
 *
 * Enforces I-002: the renderer reads state and never mutates it. Everything that wants to change
 * the simulation submits a command, which means every change is loggable, replayable, and
 * attributable.
 *
 * A command describes intent, not outcome. `entity/create` does not carry the ID it will produce;
 * the reducer derives that from state so replay stays deterministic.
 */

export interface CreateEntityCommand {
  readonly type: 'entity/create';
  readonly kind: string;
}

export interface RemoveEntityCommand {
  readonly type: 'entity/remove';
  readonly id: string;
}

/** Consumes one random value without other effect. Exists to make RNG advancement testable. */
export interface DrawCommand {
  readonly type: 'sim/draw';
}

export type Command = CreateEntityCommand | RemoveEntityCommand | DrawCommand;

/** A command paired with the tick it applies on. The command log is a list of these. */
export interface ScheduledCommand {
  readonly tick: number;
  readonly command: Command;
}

/**
 * Orders a command log deterministically.
 *
 * Sorting is by tick, and ties keep their original relative order. Two logs holding the same
 * commands in the same order therefore always produce the same run, which is what I-004 requires.
 */
export function sortCommandLog(log: readonly ScheduledCommand[]): readonly ScheduledCommand[] {
  return log
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) =>
      left.entry.tick === right.entry.tick
        ? left.index - right.index
        : left.entry.tick - right.entry.tick
    )
    .map((wrapped) => wrapped.entry);
}
