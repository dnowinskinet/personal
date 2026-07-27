/**
 * View models for the quarter race.
 *
 * Pure functions — no Angular, no DOM. Keeps display logic testable headlessly and stops
 * presentation decisions leaking into the simulation.
 */

import {
  PART_KINDS,
  TICK_MS,
  TIERS,
  countOf,
  researchLevelFor,
  totalOf,
  type PartKind,
  type PartStock,
  type QuarterConfig,
  type QuarterState,
  type Tier,
} from '../sim/index';

export interface StockRow {
  readonly kind: PartKind;
  readonly total: number;
  readonly tiers: readonly { tier: Tier; count: number }[];
  /** True when this kind is the thinnest on the shelf — the thing to worry about. */
  readonly scarcest: boolean;
}

/** Remaining time as mm:ss of simulated time. */
export function timeRemaining(state: QuarterState, config: QuarterConfig): string {
  const ticks = Math.max(0, config.lengthTicks - state.tick);
  const seconds = Math.round((ticks * TICK_MS) / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** How far through the quarter, 0..100. */
export function quarterProgress(state: QuarterState, config: QuarterConfig): number {
  return Math.min(100, Math.round((state.tick / config.lengthTicks) * 100));
}

/** True in the last fifth, when the rush should start to bite. */
export function inEndgame(state: QuarterState, config: QuarterConfig): boolean {
  return state.tick > config.lengthTicks * 0.8 && state.phase === 'running';
}

export function stockRows(stock: PartStock): readonly StockRow[] {
  const totals = PART_KINDS.map((kind) => totalOf(stock, kind));
  const lowest = Math.min(...totals);
  return PART_KINDS.map((kind, index) => ({
    kind,
    total: totals[index],
    tiers: TIERS.map((tier) => ({ tier, count: countOf(stock, kind, tier) })),
    scarcest: totals[index] === lowest,
  }));
}

/** Progress toward the next research level, 0..100. Returns 100 at the ceiling. */
export function researchProgress(state: QuarterState, config: QuarterConfig): number {
  if (state.researchLevel >= 3) {
    return 100;
  }
  const consumed = (state.researchLevel - 1) * config.researchPerLevel;
  const into = state.researchPoints - consumed;
  return Math.max(0, Math.min(100, Math.round((into / config.researchPerLevel) * 100)));
}

export function marketReadiness(state: QuarterState, config: QuarterConfig): number {
  return Math.min(100, Math.round((state.marketPoints / config.marketTarget) * 100));
}

/** Research level this many points would reach — used to preview a reallocation's effect. */
export function levelAt(points: number, config: QuarterConfig): number {
  return researchLevelFor(points, config);
}
