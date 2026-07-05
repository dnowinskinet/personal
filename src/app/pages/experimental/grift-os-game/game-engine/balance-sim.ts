import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import {
  activateHustle,
  advanceGame,
  automationCost,
  buyAutomation,
  buyHustle,
  createInitialGameState,
  maxAffordableQuantity,
  nextHustleCost,
  valuationPerSecond,
} from './economy';
import { createRugPullPreview } from './rug-pull';
import { GriftOsGameState, HustleDefinition, HustleId } from './types';

export type BalanceStrategy =
  | 'natural'
  | 'automation-rush'
  | 'expansion-first'
  | 'next-hustle-rush'
  | 'milestone-rush'
  | 'rough-roi';

export interface BalanceTimelineEntry {
  elapsedMs: number;
  action: string;
  valuation: number;
  valuationPerSecond: number;
  units: Partial<Record<HustleId, number>>;
  automated: HustleId[];
  milestones: string[];
  rugPullAvailable: boolean;
}

export interface BalanceSimulationResult {
  strategy: BalanceStrategy;
  simulatedMs: number;
  finalState: GriftOsGameState;
  timeline: BalanceTimelineEntry[];
}

export interface BalanceSimulationOptions {
  strategy: BalanceStrategy;
  durationMs?: number;
  stepMs?: number;
  definitions?: readonly HustleDefinition[];
  startingNetWorth?: number;
}

const DEFAULT_DURATION_MS = 30 * 60 * 1000;
const DEFAULT_STEP_MS = 500;

export function runBalanceSimulation(options: BalanceSimulationOptions): BalanceSimulationResult {
  const definitions = options.definitions ?? HUSTLE_DEFINITIONS;
  const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;
  const stepMs = options.stepMs ?? DEFAULT_STEP_MS;
  let state = createInitialGameState(definitions, options.startingNetWorth ?? 0);
  const timeline: BalanceTimelineEntry[] = [
    createTimelineEntry(0, 'start', state, definitions),
  ];

  for (let elapsedMs = stepMs; elapsedMs <= durationMs; elapsedMs += stepMs) {
    for (const definition of definitions) {
      const hustle = state.hustles[definition.id];

      if (hustle.units > 0 && !hustle.isActive && !hustle.isAutomated) {
        state = activateHustle(state, definition.id);
      }
    }

    const advanced = advanceGame(state, definitions, stepMs);
    state = advanced.state;
    const decision = choosePurchase(state, definitions, options.strategy);

    if (decision) {
      const before = state;

      if (decision.kind === 'automation') {
        const result = buyAutomation(state, definitions, decision.hustleId);
        state = result.state;

        if (result.purchased) {
          timeline.push(createTimelineEntry(elapsedMs, `automate ${decision.hustleId}`, state, definitions));
        } else {
          state = before;
        }
      } else {
        const result = buyHustle(state, definitions, decision.hustleId, decision.quantity);
        state = result.state;

        if (result.quantityPurchased > 0) {
          timeline.push(
            createTimelineEntry(
              elapsedMs,
              `${before.hustles[decision.hustleId].units === 0 ? 'acquire' : 'expand'} ${decision.hustleId} x${result.quantityPurchased}`,
              state,
              definitions
            )
          );
        } else {
          state = before;
        }
      }
    }
  }

  timeline.push(createTimelineEntry(durationMs, 'end', state, definitions));

  return {
    strategy: options.strategy,
    simulatedMs: durationMs,
    finalState: state,
    timeline,
  };
}

function choosePurchase(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  strategy: BalanceStrategy
): { kind: 'hustle'; hustleId: HustleId; quantity: number | 'max' } | { kind: 'automation'; hustleId: HustleId } | null {
  switch (strategy) {
    case 'automation-rush':
      return firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        cheapestExpansion(state, definitions, 1);
    case 'expansion-first':
      return cheapestExpansion(state, definitions, 1) ??
        firstAffordableUnowned(state, definitions) ??
        firstAffordableAutomation(state, definitions);
    case 'next-hustle-rush':
      return firstAffordableUnowned(state, definitions) ??
        firstAffordableAutomation(state, definitions) ??
        cheapestExpansion(state, definitions, 1);
    case 'milestone-rush':
      return nextMilestonePurchase(state, definitions) ??
        firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions);
    case 'rough-roi':
      return bestRoiPurchase(state, definitions) ??
        firstAffordableAutomation(state, definitions);
    case 'natural':
      return firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        cheapestExpansion(state, definitions, 1);
  }
}

function firstAffordableAutomation(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[]
): { kind: 'automation'; hustleId: HustleId } | null {
  const candidate = definitions.find((definition) => {
    const hustle = state.hustles[definition.id];

    return hustle.units > 0 && !hustle.isAutomated && state.valuation >= automationCost(state, definitions, definition.id);
  });

  return candidate ? { kind: 'automation', hustleId: candidate.id } : null;
}

function firstAffordableUnowned(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[]
): { kind: 'hustle'; hustleId: HustleId; quantity: number } | null {
  const candidate = definitions.find((definition) =>
    state.hustles[definition.id].units === 0 &&
    state.valuation >= nextHustleCost(definition, 0, state, definitions)
  );

  return candidate ? { kind: 'hustle', hustleId: candidate.id, quantity: 1 } : null;
}

function cheapestExpansion(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  quantity: number | 'max'
): { kind: 'hustle'; hustleId: HustleId; quantity: number | 'max' } | null {
  const candidate = definitions
    .filter((definition) => state.hustles[definition.id].units > 0)
    .map((definition) => ({
      definition,
      cost: nextHustleCost(definition, state.hustles[definition.id].units, state, definitions),
    }))
    .filter((candidate) => candidate.cost <= state.valuation)
    .sort((a, b) => a.cost - b.cost)[0];

  return candidate ? { kind: 'hustle', hustleId: candidate.definition.id, quantity } : null;
}

function nextMilestonePurchase(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[]
): { kind: 'hustle'; hustleId: HustleId; quantity: number } | null {
  for (const definition of definitions) {
    const hustle = state.hustles[definition.id];
    const nextMilestone = definition.milestones.find((milestone) =>
      !hustle.reachedMilestones.includes(milestone.id) &&
      milestone.requiredUnits > hustle.units
    );

    if (!nextMilestone || hustle.units <= 0) {
      continue;
    }

    const quantity = nextMilestone.requiredUnits - hustle.units;
    const affordable = maxAffordableQuantity(definition, hustle.units, state.valuation, state, definitions);

    if (affordable >= quantity) {
      return { kind: 'hustle', hustleId: definition.id, quantity };
    }
  }

  return null;
}

function bestRoiPurchase(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[]
): { kind: 'hustle'; hustleId: HustleId; quantity: number } | null {
  const candidate = definitions
    .map((definition) => {
      const units = state.hustles[definition.id].units;
      const cost = nextHustleCost(definition, units, state, definitions);
      const rateGain = definition.basePayout / definition.cadenceSeconds;

      return {
        definition,
        cost,
        score: rateGain / cost,
      };
    })
    .filter((candidate) => candidate.cost <= state.valuation)
    .sort((a, b) => b.score - a.score)[0];

  return candidate ? { kind: 'hustle', hustleId: candidate.definition.id, quantity: 1 } : null;
}

function createTimelineEntry(
  elapsedMs: number,
  action: string,
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[]
): BalanceTimelineEntry {
  return {
    elapsedMs,
    action,
    valuation: state.valuation,
    valuationPerSecond: valuationPerSecond(state, definitions),
    units: Object.fromEntries(
      definitions.map((definition) => [definition.id, state.hustles[definition.id].units])
    ),
    automated: definitions
      .filter((definition) => state.hustles[definition.id].isAutomated)
      .map((definition) => definition.id),
    milestones: definitions.flatMap((definition) => state.hustles[definition.id].reachedMilestones),
    rugPullAvailable: createRugPullPreview(state).isAvailable,
  };
}
