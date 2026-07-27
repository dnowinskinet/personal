/**
 * Simulation state shape.
 *
 * Two invariants are visible directly in these types:
 *
 * - **I-007** — entities are keyed by stable ID in a record, never addressed by array position.
 *   `order` exists separately for cases where presentation order matters, and holds IDs.
 * - **I-008** — every serialized state carries `schemaVersion`, so a migration can always tell what
 *   it is looking at.
 *
 * This is deliberately a substrate, not a game. Product lineups, floors, bays, cohorts and
 * incidents arrive in Gate A and Gate B. What exists here is the minimum that determinism,
 * identity, and versioning can be enforced against.
 */

/** Bumped whenever the persisted shape changes. Every bump needs a migration and a fixture. */
export const SCHEMA_VERSION = 1;

/** Anything the simulation tracks by identity. */
export interface Entity {
  readonly id: string;
  readonly kind: string;
  readonly createdAtTick: number;
}

export interface SimState {
  readonly schemaVersion: number;
  /** Seed for this run. Together with the command log it fully determines the outcome (I-004). */
  readonly seed: number;
  /** Authoritative tick count. The simulation's only notion of time (I-005). */
  readonly tick: number;
  /** Position in the random sequence. Advancing this is how randomness is consumed (I-006). */
  readonly rngCursor: number;
  /** Monotonic counter behind entity IDs. Never reused, even after removal (I-007). */
  readonly nextEntitySequence: number;
  readonly entities: Readonly<Record<string, Entity>>;
  /** Entity IDs in presentation order. Holds IDs, never indices into another array. */
  readonly order: readonly string[];
}

export function createInitialState(seed: number): SimState {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed,
    tick: 0,
    rngCursor: 0,
    nextEntitySequence: 1,
    entities: {},
    order: [],
  };
}

/**
 * Builds the next entity ID.
 *
 * IDs are derived from a monotonic sequence rather than from `entities` size or `order.length`,
 * so removing an entity can never cause a later entity to reuse its ID.
 */
export function formatEntityId(kind: string, sequence: number): string {
  return `${kind}-${sequence}`;
}

/** Reads an entity by ID. Returns `undefined` rather than throwing so callers decide the policy. */
export function findEntity(state: SimState, id: string): Entity | undefined {
  return Object.prototype.hasOwnProperty.call(state.entities, id)
    ? state.entities[id]
    : undefined;
}

/** Entities in presentation order, skipping any ID that no longer resolves. */
export function orderedEntities(state: SimState): readonly Entity[] {
  const result: Entity[] = [];
  for (const id of state.order) {
    const entity = findEntity(state, id);
    if (entity !== undefined) {
      result.push(entity);
    }
  }
  return result;
}
