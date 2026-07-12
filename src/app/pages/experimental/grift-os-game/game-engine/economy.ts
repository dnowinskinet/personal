import {
  AdvanceResult,
  AutomationPurchaseResult,
  GriftOsGameState,
  HustleId,
  HustleState,
  MilestoneReachedEvent,
  PurchaseResult,
} from './types';
import { GameMechanics, HustleMechanicsDefinition } from './mechanics';
import {
  applyAutomationCostModifiers,
  applyCadenceModifiers,
  applyCostModifiers,
  applyOutputModifiers,
  modifierBreakdownForHustle,
} from './modifiers';
import {
  advanceFounderTakePreparation,
  founderTakePreparationRemainingMs,
} from './founder-take';

export function createInitialGameState(
  definitions: GameMechanics,
  netWorth = 0,
  rugPullCount = 0
): GriftOsGameState {
  const hustles = Object.fromEntries(
    definitions.map((definition) => [
      definition.id,
      {
        id: definition.id,
        units: definition.initialUnits,
        isActive: false,
        isAutomated: false,
        progressMs: 0,
        reachedMilestones: [],
      },
    ])
  ) as unknown as Record<HustleId, HustleState>;

  return {
    valuation: 0,
    peakValuation: 0,
    netWorth,
    rugPullCount,
    rugPullState: 'unavailable',
    founderTakePreparation: {
      completedStages: 0,
      isActive: false,
      progressMs: 0,
    },
    leveragePurchases: [],
    hustles,
  };
}

export function getHustleDefinition(
  definitions: GameMechanics,
  hustleId: HustleId
): HustleMechanicsDefinition {
  const definition = definitions.find((candidate) => candidate.id === hustleId);

  if (!definition) {
    throw new Error(`Unknown GriftOS Hustle: ${hustleId}`);
  }

  return definition;
}

export function nextHustleCost(
  definition: HustleMechanicsDefinition,
  units: number,
  state?: GriftOsGameState,
  definitions?: GameMechanics
): number {
  const baseCost = definition.acquisitionCost * definition.growthRate ** units;

  if (!state) {
    return baseCost;
  }

  return applyCostModifiers(
    baseCost,
    modifierBreakdownForHustle(state, requireMechanics(definitions), definition.id)
  );
}

export function hustleCostForQuantity(
  definition: HustleMechanicsDefinition,
  units: number,
  quantity: number,
  state?: GriftOsGameState,
  definitions?: GameMechanics
): number {
  if (quantity <= 0) {
    return 0;
  }

  const nextCost = nextHustleCost(definition, units, state, definitions);

  if (definition.growthRate === 1) {
    return nextCost * quantity;
  }

  return nextCost * ((definition.growthRate ** quantity - 1) / (definition.growthRate - 1));
}

export function maxAffordableQuantity(
  definition: HustleMechanicsDefinition,
  units: number,
  availableValuation: number,
  state?: GriftOsGameState,
  definitions?: GameMechanics
): number {
  if (availableValuation <= 0) {
    return 0;
  }

  const nextCost = nextHustleCost(definition, units, state, definitions);

  if (availableValuation < nextCost) {
    return 0;
  }

  if (definition.growthRate === 1) {
    return Math.floor(availableValuation / nextCost);
  }

  const rawQuantity = Math.floor(
    Math.log((availableValuation * (definition.growthRate - 1)) / nextCost + 1) /
      Math.log(definition.growthRate)
  );

  let quantity = Math.max(0, rawQuantity);

  while (
    quantity > 0 &&
    hustleCostForQuantity(definition, units, quantity, state, definitions) > availableValuation
  ) {
    quantity -= 1;
  }

  while (
    hustleCostForQuantity(definition, units, quantity + 1, state, definitions) <= availableValuation
  ) {
    quantity += 1;
  }

  return quantity;
}

export function buyHustle(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId,
  quantity: number | 'max'
): PurchaseResult {
  const definition = getHustleDefinition(definitions, hustleId);
  const hustle = state.hustles[hustleId];

  const quantityToBuy = quantity === 'max'
    ? maxAffordableQuantity(definition, hustle.units, state.valuation, state, definitions)
    : Math.max(0, Math.floor(quantity));
  const totalCost = hustleCostForQuantity(definition, hustle.units, quantityToBuy, state, definitions);

  if (quantityToBuy <= 0 || totalCost > state.valuation) {
    return {
      state,
      quantityPurchased: 0,
      totalCost: 0,
      milestonesReached: [],
    };
  }

  const nextUnits = hustle.units + quantityToBuy;
  const milestonesReached = newlyReachedMilestones(definition, hustle, nextUnits);
  const reachedMilestones = [
    ...hustle.reachedMilestones,
    ...milestonesReached.map((event) => event.milestoneId),
  ];
  const valuation = Math.max(0, state.valuation - totalCost);

  return {
    state: {
      ...state,
      valuation,
      peakValuation: Math.max(state.peakValuation, valuation),
      hustles: {
        ...state.hustles,
        [hustleId]: {
          ...hustle,
          units: nextUnits,
          reachedMilestones,
        },
      },
    },
    quantityPurchased: quantityToBuy,
    totalCost,
    milestonesReached,
  };
}

export function automationCost(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): number {
  const definition = getHustleDefinition(definitions, hustleId);

  return applyAutomationCostModifiers(
    definition.automationCost,
    modifierBreakdownForHustle(state, definitions, hustleId)
  );
}

export function canBuyAutomation(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): boolean {
  const hustle = state.hustles[hustleId];

  return hustle.units > 0 && !hustle.isAutomated && state.valuation >= automationCost(state, definitions, hustleId);
}

export function buyAutomation(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): AutomationPurchaseResult {
  if (!canBuyAutomation(state, definitions, hustleId)) {
    return {
      state,
      purchased: false,
      totalCost: 0,
    };
  }

  const totalCost = automationCost(state, definitions, hustleId);
  const hustle = state.hustles[hustleId];
  const valuation = Math.max(0, state.valuation - totalCost);

  return {
    state: {
      ...state,
      valuation,
      peakValuation: Math.max(state.peakValuation, valuation),
      hustles: {
        ...state.hustles,
        [hustleId]: {
          ...hustle,
          isActive: true,
          isAutomated: true,
        },
      },
    },
    purchased: true,
    totalCost,
  };
}

export function activateHustle(
  state: GriftOsGameState,
  hustleId: HustleId
): GriftOsGameState {
  const hustle = state.hustles[hustleId];

  if (hustle.units <= 0 || hustle.isActive) {
    return state;
  }

  return {
    ...state,
    hustles: {
      ...state.hustles,
      [hustleId]: {
        ...hustle,
        isActive: true,
        progressMs: 0,
      },
    },
  };
}

export function hustlePayout(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): number {
  const definition = getHustleDefinition(definitions, hustleId);
  const hustle = state.hustles[hustleId];
  const basePayout = definition.basePayout * hustle.units;

  return applyOutputModifiers(
    basePayout,
    modifierBreakdownForHustle(state, definitions, hustleId)
  );
}

export function effectiveCadenceSeconds(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): number {
  const definition = getHustleDefinition(definitions, hustleId);

  return applyCadenceModifiers(
    definition.cadenceSeconds,
    modifierBreakdownForHustle(state, definitions, hustleId)
  );
}

export function advanceGame(
  state: GriftOsGameState,
  definitions: GameMechanics,
  elapsedMs: number
): AdvanceResult {
  if (elapsedMs <= 0) {
    return { state, events: [] };
  }

  let nextState = state;
  let remainingMs = elapsedMs;
  const events: AdvanceResult['events'] = [];

  while (remainingMs > 0) {
    const preparationRemainingMs = founderTakePreparationRemainingMs(nextState, definitions);

    if (preparationRemainingMs !== null && preparationRemainingMs <= 0) {
      nextState = advanceFounderTakePreparation(nextState, 0, definitions);
      continue;
    }

    const sliceMs = preparationRemainingMs === null
      ? remainingMs
      : Math.min(remainingMs, preparationRemainingMs);
    const advanced = advanceProduction(nextState, definitions, sliceMs);
    events.push(...advanced.events);
    nextState = advanceFounderTakePreparation(advanced.state, sliceMs, definitions);
    remainingMs -= sliceMs;
  }

  return { state: nextState, events };
}

function advanceProduction(
  state: GriftOsGameState,
  definitions: GameMechanics,
  elapsedMs: number
): AdvanceResult {

  let valuation = state.valuation;
  const events: AdvanceResult['events'] = [];
  const hustles = { ...state.hustles };

  for (const definition of definitions) {
    const hustle = hustles[definition.id];

    if ((!hustle.isActive && !hustle.isAutomated) || hustle.units <= 0) {
      continue;
    }

    const cadenceMs = effectiveCadenceSeconds(
      { ...state, hustles },
      definitions,
      definition.id
    ) * 1000;
    const nextProgress = hustle.progressMs + elapsedMs;

    if (nextProgress >= cadenceMs) {
      const cyclesCompleted = hustle.isAutomated
        ? Math.floor(nextProgress / cadenceMs)
        : 1;
      const payout = hustlePayout({ ...state, valuation, hustles }, definitions, definition.id);
      const totalPayout = payout * cyclesCompleted;
      valuation += totalPayout;

      events.push({
        hustleId: definition.id,
        payout,
        cyclesCompleted,
      });

      hustles[definition.id] = {
        ...hustle,
        isActive: hustle.isAutomated,
        progressMs: hustle.isAutomated ? nextProgress % cadenceMs : 0,
      };
    } else {
      hustles[definition.id] = {
        ...hustle,
        isActive: hustle.isAutomated || hustle.isActive,
        progressMs: nextProgress,
      };
    }
  }

  return {
    state: {
      ...state,
      valuation,
      peakValuation: Math.max(state.peakValuation, valuation),
      hustles,
    },
    events,
  };
}

export function valuationPerSecond(
  state: GriftOsGameState,
  definitions: GameMechanics
): number {
  return definitions.reduce((total, definition) => {
    const hustle = state.hustles[definition.id];

    if (!hustle.isAutomated && !hustle.isActive) {
      return total;
    }

    return total + hustlePayout(state, definitions, definition.id) /
      effectiveCadenceSeconds(state, definitions, definition.id);
  }, 0);
}

function newlyReachedMilestones(
  definition: HustleMechanicsDefinition,
  hustle: HustleState,
  nextUnits: number
): MilestoneReachedEvent[] {
  return definition.milestones
    .filter((milestone) =>
      nextUnits >= milestone.requiredUnits &&
      !hustle.reachedMilestones.includes(milestone.id)
    )
    .map((milestone) => ({
      hustleId: definition.id,
      milestoneId: milestone.id,
    }));
}

export const nextGeneratorCost = nextHustleCost;
export const generatorCostForQuantity = hustleCostForQuantity;
export const buyGenerator = buyHustle;
export const activateGenerator = activateHustle;
export const generatorPayout = (definition: HustleMechanicsDefinition, units: number): number =>
  definition.basePayout * units;

function requireMechanics(mechanics?: GameMechanics): GameMechanics {
  if (!mechanics) {
    throw new Error('GriftOS mechanics are required when calculating modified values.');
  }

  return mechanics;
}
