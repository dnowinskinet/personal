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

/**
 * An even split across the sinks that actually exist this quarter.
 *
 * Splitting three ways regardless left a third of the staff assigned to market prep in a quarter
 * where market prep is switched off — idle by definition, and it made the teaching quarters
 * unwinnable for a player who touched nothing.
 */
export function evenAllocation(staff: number, config?: QuarterConfig): Allocation {
  const research = config === undefined || config.enabled.research;
  const market = config === undefined || config.enabled.market;
  const sinks = 1 + (research ? 1 : 0) + (market ? 1 : 0);
  const each = Math.floor(staff / sinks);
  return {
    research: research ? each : 0,
    production: staff - (research ? each : 0) - (market ? each : 0),
    market: market ? each : 0,
  };
}

export function startQuarter(config: QuarterConfig, seed: number): QuarterState {
  // With allocation switched off everyone is a producer. Showing a split the player cannot change
  // would be a lie about where the staff are.
  const allocation = config.enabled.allocation
    ? evenAllocation(config.staff, config)
    : { research: 0, production: config.staff, market: 0 };

  return {
    schemaVersion: SCHEMA_VERSION,
    seed,
    tick: 0,
    phase: 'running',
    allocation,
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
  if (state.phase !== 'running' || !config.enabled.allocation) {
    return state;
  }

  const clamped = clampAllocation(withoutDisabledSinks(next, config), config.staff);
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

export function setFocus(
  state: QuarterState,
  focus: ProductionFocus,
  config?: QuarterConfig
): QuarterState {
  if (state.phase !== 'running' || state.focus === focus) {
    return state;
  }
  if (config !== undefined && !config.enabled.focus) {
    return state;
  }
  return {
    ...state,
    focus,
    reallocations: state.reallocations + 1,
    log: [...state.log, { tick: state.tick, text: `Production switched to ${focus}.` }],
  };
}

/**
 * Moves staff off any sink that does not exist this quarter.
 *
 * You cannot put someone in a department that has not been built. Without this, both the policy
 * bots and the UI could park staff on market prep during a quarter with no marketing, where they
 * did nothing at all — which is what made the teaching quarters look unwinnable.
 */
function withoutDisabledSinks(allocation: Allocation, config: QuarterConfig): Allocation {
  const research = config.enabled.research ? allocation.research : 0;
  const market = config.enabled.market ? allocation.market : 0;
  const displaced =
    (config.enabled.research ? 0 : allocation.research) + (config.enabled.market ? 0 : allocation.market);
  return { research, production: allocation.production + displaced, market };
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
