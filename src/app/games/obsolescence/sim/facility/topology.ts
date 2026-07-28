/**
 * Navigation topology: corridors, the personnel core, and paths between cells.
 *
 * R10's failure autopsies are blunt that abstracted circulation is what killed Project Highrise's
 * tower feeling, and that pathfinding defects destroy player trust faster than anything else. So
 * movement here is explicit: real cells, real distances, and a path that can fail with a stated
 * reason rather than teleporting.
 *
 * The graph is rebuilt whenever construction changes. R10 calls path invalidation after edits a
 * required behaviour, and it is the single most common source of stuck-agent bugs in the genre.
 */

import {
  CORRIDOR_FROM,
  CORRIDOR_TO,
  PERSONNEL_CORE_CELLS,
  cellKey,
  horizontalDistance,
  sameCell,
  type Cell,
} from './grid';

/** Ticks to move one cell horizontally, and one floor vertically through the core. */
export interface TravelCosts {
  readonly perCell: number;
  readonly perLevel: number;
  /** Fixed cost of entering the core at all — standing in for a lift wait until lifts exist. */
  readonly coreEntry: number;
}

export interface Topology {
  /** Levels that exist and are reachable. */
  readonly levels: readonly number[];
  readonly costs: TravelCosts;
  /** Monotonic counter — bumped on every rebuild so stale paths can be detected. */
  readonly generation: number;
}

export type PathFailure = 'level-unreachable' | 'blocked-corridor' | 'no-core-access';

export interface Path {
  readonly ok: boolean;
  /** Cells in order, including start and goal. Empty when the path failed. */
  readonly cells: readonly Cell[];
  /** Ticks the walk will take. */
  readonly cost: number;
  readonly failure: PathFailure | null;
  /** Topology generation this path was computed against. */
  readonly generation: number;
}

export const DEFAULT_TRAVEL_COSTS: TravelCosts = { perCell: 1, perLevel: 6, coreEntry: 3 };

export function buildTopology(
  levels: readonly number[],
  costs: TravelCosts = DEFAULT_TRAVEL_COSTS,
  generation = 1
): Topology {
  // Sorted so iteration order — and therefore any tie-break — is deterministic.
  return { levels: [...levels].sort((left, right) => left - right), costs, generation };
}

/** Rebuild after construction. Callers must re-plan anything holding an older generation. */
export function invalidate(topology: Topology, levels: readonly number[]): Topology {
  return buildTopology(levels, topology.costs, topology.generation + 1);
}

export function isReachableLevel(topology: Topology, level: number): boolean {
  return topology.levels.includes(level);
}

/** Clamp a cell into the walkable corridor span. */
function toCorridor(x: number): number {
  return Math.min(CORRIDOR_TO, Math.max(CORRIDOR_FROM, x));
}

/**
 * Finds a path from `start` to `goal`.
 *
 * The building is a corridor per floor plus one vertical core, so the shortest route is always
 * "walk to the core, ride, walk to the target" — no search is needed, and a closed-form answer is
 * both faster and perfectly deterministic. If floors ever gain internal obstacles this becomes a
 * grid A*; the signature is shaped for that.
 */
export function findPath(topology: Topology, start: Cell, goal: Cell): Path {
  const fail = (failure: PathFailure): Path => ({
    ok: false,
    cells: [],
    cost: 0,
    failure,
    generation: topology.generation,
  });

  if (!isReachableLevel(topology, start.level) || !isReachableLevel(topology, goal.level)) {
    return fail('level-unreachable');
  }

  if (sameCell(start, goal)) {
    return { ok: true, cells: [start], cost: 0, failure: null, generation: topology.generation };
  }

  const cells: Cell[] = [];
  let cost = 0;

  if (start.level === goal.level) {
    const step = goal.x >= start.x ? 1 : -1;
    for (let x = start.x; x !== goal.x + step; x += step) {
      cells.push({ level: start.level, x });
    }
    cost = horizontalDistance(start, goal) * topology.costs.perCell;
    return { ok: true, cells, cost, failure: null, generation: topology.generation };
  }

  // Different floors: walk to the personnel core, ride it, walk out.
  const corePoint = PERSONNEL_CORE_CELLS.to;
  const walkOut = { level: start.level, x: corePoint };
  const walkIn = { level: goal.level, x: corePoint };

  const stepOut = corePoint >= start.x ? 1 : -1;
  for (let x = start.x; x !== corePoint + stepOut; x += stepOut) {
    cells.push({ level: start.level, x });
  }
  cost += horizontalDistance(start, walkOut) * topology.costs.perCell;

  const levels = Math.abs(goal.level - start.level);
  cost += topology.costs.coreEntry + levels * topology.costs.perLevel;
  cells.push(walkIn);

  const stepIn = goal.x >= corePoint ? 1 : -1;
  for (let x = corePoint + stepIn; x !== goal.x + stepIn; x += stepIn) {
    cells.push({ level: goal.level, x });
  }
  cost += horizontalDistance(walkIn, goal) * topology.costs.perCell;

  return { ok: true, cells, cost, failure: null, generation: topology.generation };
}

/**
 * Estimated travel ticks without building the full path.
 *
 * Used by job scoring, which evaluates many candidates per decision and must not allocate a path
 * array for each one.
 */
export function estimateTravel(topology: Topology, start: Cell, goal: Cell): number {
  if (!isReachableLevel(topology, start.level) || !isReachableLevel(topology, goal.level)) {
    return Number.POSITIVE_INFINITY;
  }
  if (start.level === goal.level) {
    return horizontalDistance(start, goal) * topology.costs.perCell;
  }
  const corePoint = PERSONNEL_CORE_CELLS.to;
  const levels = Math.abs(goal.level - start.level);
  return (
    Math.abs(start.x - corePoint) * topology.costs.perCell +
    topology.costs.coreEntry +
    levels * topology.costs.perLevel +
    Math.abs(goal.x - corePoint) * topology.costs.perCell
  );
}

/** True when a path was computed against an older topology and must be replanned. */
export function isStale(path: Path, topology: Topology): boolean {
  return path.generation !== topology.generation;
}

export { toCorridor, cellKey };
