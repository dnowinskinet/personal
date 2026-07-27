/**
 * Policy bots and the balance sweep — the machine-measurable half of Gate A.
 *
 * This is the instrument that replaces a tester panel (D-003). It answers three questions a human
 * could not: is any single sink a right answer, does being present while the clock runs beat
 * setting it once, and does the assembly menu ever actually bite.
 */

import {
  PART_KINDS,
  advanceBy,
  assemblyOptions,
  bestAvailable,
  countOf,
  evenAllocation,
  reallocate,
  resolveQuarter,
  runToDeadline,
  setFocus,
  startQuarter,
  type Allocation,
  type PartKind,
  type ProductionFocus,
  type QuarterConfig,
  type QuarterOutcome,
  type QuarterState,
} from '../sim/index';

export type BotName = 'research-heavy' | 'production-heavy' | 'market-heavy' | 'balanced' | 'adaptive';

export const SINGLE_SINK_BOTS: readonly BotName[] = ['research-heavy', 'production-heavy', 'market-heavy'];

export interface BotResult {
  readonly name: BotName;
  readonly outcome: QuarterOutcome;
  readonly state: QuarterState;
  /** True when some product grade was unbuildable at the deadline. */
  readonly hadBlockedOption: boolean;
}

function weighted(staff: number, research: number, production: number, market: number): Allocation {
  const total = research + production + market;
  const r = Math.round((staff * research) / total);
  const m = Math.round((staff * market) / total);
  return { research: r, production: Math.max(0, staff - r - m), market: m };
}

function allocationFor(name: BotName, staff: number): Allocation {
  switch (name) {
    case 'research-heavy':
      return weighted(staff, 7, 2, 1);
    case 'production-heavy':
      return weighted(staff, 1, 8, 1);
    case 'market-heavy':
      return weighted(staff, 1, 2, 7);
    default:
      return evenAllocation(staff);
  }
}

/**
 * The adaptive bot: research first to raise the tier ceiling, then production to fill the shelves,
 * then market prep so the thing is not launched into silence.
 *
 * This is the play the design is betting on. If a static allocation matches it, there is no reason
 * to be present while the clock runs.
 */
function adaptiveRun(config: QuarterConfig, seed: number): QuarterState {
  const quarter = config.lengthTicks;
  let state = startQuarter(config, seed);
  state = setFocus(state, 'balanced');

  // Phase 1: research until the tier ceiling is raised, or until it stops being worth waiting for.
  // Reacting to state rather than a fixed schedule is the point — a fixed schedule would be just
  // another static allocation with extra steps.
  state = reallocate(state, config, weighted(config.staff, 8, 3, 1));
  const researchDeadline = Math.floor(quarter * 0.55);
  while (state.phase === 'running' && state.tick < researchDeadline && state.researchLevel < 3) {
    state = advanceBy(state, config, 10);
  }

  // Phase 2: fill the shelves, steering production at whatever is scarcest at the current ceiling.
  // This is where being present pays. A set-and-forget run cannot notice it is three cells short
  // with 400 ticks left; this checks and redirects.
  state = reallocate(state, config, weighted(config.staff, 1, 9, 2));
  const buildDeadline = Math.floor(quarter * 0.85);
  while (state.phase === 'running' && state.tick < buildDeadline) {
    state = setFocus(state, scarcestAtCeiling(state));
    state = advanceBy(state, config, Math.min(60, buildDeadline - state.tick));
  }

  // Phase 3: make sure someone knows it exists.
  state = reallocate(state, config, weighted(config.staff, 1, 3, 8));
  return runToDeadline(state, config);
}

/** Which part kind has fewest units at the best tier currently producible. */
function scarcestAtCeiling(state: QuarterState): ProductionFocus {
  const tier = Math.max(1, Math.min(3, state.researchLevel)) as 1 | 2 | 3;
  let scarcest: PartKind = PART_KINDS[0];
  let lowest = Number.POSITIVE_INFINITY;
  for (const kind of PART_KINDS) {
    const held = countOf(state.stock, kind, tier);
    if (held < lowest) {
      lowest = held;
      scarcest = kind;
    }
  }
  return scarcest;
}

export function runBot(name: BotName, config: QuarterConfig, seed: number): BotResult {
  let state: QuarterState;

  if (name === 'adaptive') {
    state = adaptiveRun(config, seed);
  } else {
    state = startQuarter(config, seed);
    state = reallocate(state, config, allocationFor(name, config.staff));
    state = runToDeadline(state, config);
  }

  const options = assemblyOptions(state.stock);
  const best = bestAvailable(state.stock);
  const outcome = resolveQuarter(state, config, best?.id ?? null);

  return {
    name,
    outcome,
    state,
    hadBlockedOption: options.some((option) => !option.available),
  };
}

export const ALL_BOTS: readonly BotName[] = [
  'research-heavy',
  'production-heavy',
  'market-heavy',
  'balanced',
  'adaptive',
];

export interface SweepResult {
  readonly seeds: number;
  readonly meanScore: Readonly<Record<BotName, number>>;
  readonly wins: Readonly<Record<BotName, number>>;
  /** Share of seeds where a single-sink bot took the top score. Gate A fails above 0.55. */
  readonly singleSinkWinShare: number;
  /** Share where the reallocating bot beat the best static one. Gate A fails below 0.6. */
  readonly adaptiveEdge: number;
  /** Share where some grade was unbuildable. Gate A fails below 0.3. */
  readonly blockedShare: number;
  readonly goalMetShare: Readonly<Record<BotName, number>>;
}

export function runSweep(config: QuarterConfig, seeds: number): SweepResult {
  const totals = {} as Record<BotName, number>;
  const wins = {} as Record<BotName, number>;
  const goals = {} as Record<BotName, number>;
  for (const name of ALL_BOTS) {
    totals[name] = 0;
    wins[name] = 0;
    goals[name] = 0;
  }

  let singleSinkWins = 0;
  let adaptiveBeatsStatic = 0;
  let blocked = 0;

  for (let index = 0; index < seeds; index += 1) {
    const seed = 1000 + index * 7919;
    const results = ALL_BOTS.map((name) => runBot(name, config, seed));

    let best = results[0];
    for (const result of results) {
      totals[result.name] += result.outcome.score;
      if (result.outcome.goalMet) {
        goals[result.name] += 1;
      }
      if (result.outcome.score > best.outcome.score) {
        best = result;
      }
    }

    wins[best.name] += 1;
    if (SINGLE_SINK_BOTS.includes(best.name)) {
      singleSinkWins += 1;
    }

    const adaptive = results.find((result) => result.name === 'adaptive');
    const bestStatic = results
      .filter((result) => result.name !== 'adaptive')
      .reduce((top, result) => (result.outcome.score > top.outcome.score ? result : top));
    if (adaptive !== undefined && adaptive.outcome.score > bestStatic.outcome.score) {
      adaptiveBeatsStatic += 1;
    }

    // Measured on the BALANCED bot, not the adaptive one. The question is whether the constraint
    // bites in reasonable non-expert play — an expert who watches the shelves and redirects
    // production should be able to route around it, and it would be wrong to call that a failure.
    const balanced = results.find((result) => result.name === 'balanced');
    if (balanced?.hadBlockedOption === true) {
      blocked += 1;
    }
  }

  const mean = {} as Record<BotName, number>;
  const goalShare = {} as Record<BotName, number>;
  for (const name of ALL_BOTS) {
    mean[name] = Math.round((totals[name] / seeds) * 10) / 10;
    goalShare[name] = Math.round((goals[name] / seeds) * 1000) / 10;
  }

  return {
    seeds,
    meanScore: mean,
    wins,
    goalMetShare: goalShare,
    singleSinkWinShare: singleSinkWins / seeds,
    adaptiveEdge: adaptiveBeatsStatic / seeds,
    blockedShare: blocked / seeds,
  };
}

/** Focus sensitivity — proves that what production concentrates on actually matters. */
export function focusMatters(config: QuarterConfig, seeds: number): number {
  let differed = 0;
  for (let index = 0; index < seeds; index += 1) {
    const seed = 1000 + index * 7919;
    const scores = (['balanced', 'chassis'] as ProductionFocus[]).map((focus) => {
      let state = startQuarter(config, seed);
      state = reallocate(state, config, evenAllocation(config.staff));
      state = setFocus(state, focus);
      state = runToDeadline(state, config);
      return resolveQuarter(state, config, bestAvailable(state.stock)?.id ?? null).score;
    });
    if (Math.abs(scores[0] - scores[1]) >= 5) {
      differed += 1;
    }
  }
  return differed / seeds;
}
