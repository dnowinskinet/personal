/**
 * Pure reducers.
 *
 * Every function here is `(state, input) => state`. No mutation, no I/O, no time, no randomness
 * beyond the seeded cursor carried in state. This is what makes I-004 achievable.
 */

import type { Command } from './commands';
import { createInitialState, formatEntityId, type Entity, type SimState } from './state';

/** Applies one command. Unknown commands return state unchanged rather than throwing. */
export function applyCommand(state: SimState, command: Command): SimState {
  switch (command.type) {
    case 'entity/create': {
      const id = formatEntityId(command.kind, state.nextEntitySequence);
      return {
        ...state,
        nextEntitySequence: state.nextEntitySequence + 1,
        entities: {
          ...state.entities,
          [id]: { id, kind: command.kind, createdAtTick: state.tick },
        },
        order: [...state.order, id],
      };
    }

    case 'entity/remove': {
      if (!Object.prototype.hasOwnProperty.call(state.entities, command.id)) {
        return state;
      }
      const remaining: Record<string, Entity> = {};
      for (const [id, entity] of Object.entries(state.entities)) {
        if (id !== command.id) {
          remaining[id] = entity;
        }
      }
      return {
        ...state,
        entities: remaining,
        order: state.order.filter((id) => id !== command.id),
      };
    }

    case 'sim/draw': {
      // Advancing the cursor is the whole effect. The value itself is derived on demand by any
      // reader calling randomAt(seed, cursor), so it never needs storing.
      return { ...state, rngCursor: state.rngCursor + 1 };
    }

    default:
      return state;
  }
}

/**
 * Advances exactly one tick.
 *
 * Per-tick simulation logic belongs here. It is intentionally near-empty for now — the substrate
 * has to be provably deterministic before any behaviour is layered onto it.
 */
export function advanceTick(state: SimState): SimState {
  return { ...state, tick: state.tick + 1 };
}

/** Convenience for tests and tooling that want a fresh state without importing two modules. */
export function reset(seed: number): SimState {
  return createInitialState(seed);
}
