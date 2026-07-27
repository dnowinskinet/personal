/**
 * What one tick of the quarter does.
 *
 * Pure. Every value is a function of state, config and the seeded generator — no wall clock, no
 * ambient randomness (I-006).
 */

import { randomAt } from '../rng';
import {
  PART_KINDS,
  emptyStock,
  type Allocation,
  type PartKind,
  type PartStock,
  type ProductionFocus,
  type QuarterConfig,
  type QuarterState,
  type Tier,
} from './types';

/** Research points one staff member generates per tick. */
const RESEARCH_PER_STAFF_TICK = 0.06;

/** Market points one staff member generates per tick. */
const MARKET_PER_STAFF_TICK = 0.05;

/** Highest research level reachable. Also the highest part tier. */
export const MAX_RESEARCH_LEVEL = 3;

export function researchLevelFor(points: number, config: QuarterConfig): number {
  return Math.max(1, Math.min(MAX_RESEARCH_LEVEL, 1 + Math.floor(points / config.researchPerLevel)));
}

/**
 * Which part kind this production cycle yields.
 *
 * `balanced` cycles through the kinds so no category starves, which is the safe option. Focusing
 * fills one shelf fast and leaves the others empty — that is how you arrive at the deadline unable
 * to build anything.
 */
function kindFor(focus: ProductionFocus, produced: number): PartKind {
  if (focus === 'balanced') {
    return PART_KINDS[produced % PART_KINDS.length];
  }
  return focus;
}

/**
 * Tier of the part just produced.
 *
 * Capped by research level — you cannot build what you have not researched. Within that cap,
 * workforce skill decides how often you hit the ceiling rather than falling a tier short.
 */
function tierFor(researchLevel: number, skill: number, seed: number, cursor: number): Tier {
  const ceiling = Math.max(1, Math.min(MAX_RESEARCH_LEVEL, researchLevel)) as Tier;
  if (ceiling === 1) {
    return 1;
  }
  // Hitting the ceiling is harder than raw skill suggests. This is the lever that makes the
  // assembly menu bite: scarcity of TOP-tier parts constrains what you can build without also
  // reducing throughput, which would just add noise and wash out the value of paying attention.
  const roll = randomAt(seed, cursor);
  if (roll < skill * 0.72) {
    return ceiling;
  }
  return Math.max(1, ceiling - 1) as Tier;
}

function addPart(stock: PartStock, kind: PartKind, tier: Tier): PartStock {
  const next = emptyStock() as unknown as Record<PartKind, Record<Tier, number>>;
  for (const each of PART_KINDS) {
    next[each] = { 1: stock[each][1], 2: stock[each][2], 3: stock[each][3] };
  }
  next[kind][tier] += 1;
  return next;
}

/** Staff actually assigned, ignoring any over-allocation beyond the pool. */
export function assignedStaff(allocation: Allocation): number {
  return allocation.research + allocation.production + allocation.market;
}

/** Advances the quarter by exactly one tick. */
export function advanceQuarter(state: QuarterState, config: QuarterConfig): QuarterState {
  if (state.phase !== 'running') {
    return state;
  }

  const tick = state.tick + 1;
  const { allocation } = state;

  const researchPoints =
    state.researchPoints + allocation.research * RESEARCH_PER_STAFF_TICK * (0.5 + config.workforceSkill);
  const marketPoints =
    state.marketPoints + allocation.market * MARKET_PER_STAFF_TICK * (0.5 + config.workforceSkill);
  const researchLevel = researchLevelFor(researchPoints, config);

  // Production. Progress accumulates so the rate can be well below one part per tick.
  let progress =
    state.productionProgress +
    allocation.production * config.productionRate * (0.6 + config.workforceSkill * 0.7);
  let stock = state.stock;
  let produced = countProduced(state.stock);

  while (progress >= 1) {
    progress -= 1;
    const kind = kindFor(state.focus, produced);
    const tier = tierFor(researchLevel, config.workforceSkill, state.seed, tick * 7 + produced);
    stock = addPart(stock, kind, tier);
    produced += 1;
  }

  const phase = tick >= config.lengthTicks ? 'assembly' : 'running';
  const log =
    phase === 'assembly'
      ? [...state.log, { tick, text: 'The quarter is over. Build something from what you have.' }]
      : state.log;

  return {
    ...state,
    tick,
    phase,
    researchPoints,
    researchLevel,
    marketPoints,
    productionProgress: progress,
    stock,
    log,
  };
}

function countProduced(stock: PartStock): number {
  let total = 0;
  for (const kind of PART_KINDS) {
    total += stock[kind][1] + stock[kind][2] + stock[kind][3];
  }
  return total;
}
