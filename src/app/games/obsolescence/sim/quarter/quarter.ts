/**
 * Quarter lifecycle: start, reallocate, run, resolve.
 *
 * Reallocation is counted, because Gate A condition 2 turns on whether being present while the
 * clock runs actually beats setting it once and walking away.
 */

import { SCHEMA_VERSION } from '../state';
import { advanceQuarter, assignedStaff, researchLevelFor } from './production';
import {
  emptyStock,
  type Allocation,
  type ProductionFocus,
  type QuarterConfig,
  type QuarterState,
} from './types';

/** An even split. Deliberately unremarkable so every move away from it is the player's. */
export function evenAllocation(staff: number): Allocation {
  const each = Math.floor(staff / 3);
  return { research: each, production: staff - each * 2, market: each };
}

export function startQuarter(config: QuarterConfig, seed: number): QuarterState {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed,
    tick: 0,
    phase: 'running',
    allocation: evenAllocation(config.staff),
    focus: 'balanced',
    researchPoints: 0,
    researchLevel: 1,
    marketPoints: 0,
    productionProgress: 0,
    stock: emptyStock(),
    reallocations: 0,
    log: [{ tick: 0, text: 'Quarter opens. The clock is running.' }],
  };
}

/**
 * Moves staff between sinks.
 *
 * Over-allocation is clamped rather than rejected — the UI should not be able to wedge the
 * simulation into an invalid state, and a clamp is easier to read than an error.
 */
export function reallocate(
  state: QuarterState,
  config: QuarterConfig,
  next: Allocation
): QuarterState {
  if (state.phase !== 'running') {
    return state;
  }

  const clamped = clampAllocation(next, config.staff);
  const changed =
    clamped.research !== state.allocation.research ||
    clamped.production !== state.allocation.production ||
    clamped.market !== state.allocation.market;

  if (!changed) {
    return state;
  }

  return {
    ...state,
    allocation: clamped,
    reallocations: state.reallocations + 1,
    log: [
      ...state.log,
      {
        tick: state.tick,
        text: `Reassigned: ${clamped.research} research / ${clamped.production} production / ${clamped.market} market.`,
      },
    ],
  };
}

export function setFocus(state: QuarterState, focus: ProductionFocus): QuarterState {
  if (state.phase !== 'running' || state.focus === focus) {
    return state;
  }
  return {
    ...state,
    focus,
    reallocations: state.reallocations + 1,
    log: [...state.log, { tick: state.tick, text: `Production switched to ${focus}.` }],
  };
}

function clampAllocation(allocation: Allocation, staff: number): Allocation {
  const research = Math.max(0, Math.round(allocation.research));
  const production = Math.max(0, Math.round(allocation.production));
  const market = Math.max(0, Math.round(allocation.market));
  const total = research + production + market;
  if (total <= staff) {
    return { research, production, market };
  }
  // Scale down proportionally, then give any rounding remainder to production.
  const factor = staff / total;
  const scaledResearch = Math.floor(research * factor);
  const scaledMarket = Math.floor(market * factor);
  return {
    research: scaledResearch,
    production: Math.max(0, staff - scaledResearch - scaledMarket),
    market: scaledMarket,
  };
}

/** Runs to the deadline without intervention. Used by bots and by fast-forward. */
export function runToDeadline(state: QuarterState, config: QuarterConfig): QuarterState {
  let current = state;
  while (current.phase === 'running') {
    current = advanceQuarter(current, config);
  }
  return current;
}

/** Advances a number of ticks, stopping at the deadline. */
export function advanceBy(state: QuarterState, config: QuarterConfig, ticks: number): QuarterState {
  let current = state;
  for (let index = 0; index < ticks && current.phase === 'running'; index += 1) {
    current = advanceQuarter(current, config);
  }
  return current;
}

export { advanceQuarter, assignedStaff, researchLevelFor };
