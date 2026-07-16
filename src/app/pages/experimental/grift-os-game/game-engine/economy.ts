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
  ResolvedModifierContext,
  resolveModifierContext,
} from './modifiers';
import {
  advanceExtractionPreparation,
  extractionPreparationRemainingMs,
} from './extraction';

export function createInitialGameState(
  definitions: GameMechanics,
  netWorth = 0,
  rugPullCount = 0,
  peakNetWorth = netWorth
): GriftOsGameState {
  const hustles = Object.fromEntries(
    definitions.map((definition) => [
      definition.id,
      {
        id: definition.id,
        scaleCount: definition.initialScaleCount,
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
    peakNetWorth: Math.max(netWorth, peakNetWorth),
    rugPullCount,
    rugPullState: 'unavailable',
    extractionPreparation: {
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
  scaleCount: number,
  state?: GriftOsGameState,
  definitions?: GameMechanics,
  modifierContext?: ResolvedModifierContext
): number {
  const baseCost = definition.acquisitionCost * definition.growthRate ** scaleCount;

  if (!state) {
    return baseCost;
  }

  return applyCostModifiers(
    baseCost,
    modifierBreakdownForHustle(
      state,
      requireMechanics(definitions),
      definition.id,
      modifierContext
    )
  );
}

export function hustleCostForQuantity(
  definition: HustleMechanicsDefinition,
  scaleCount: number,
  quantity: number,
  state?: GriftOsGameState,
  definitions?: GameMechanics,
  modifierContext?: ResolvedModifierContext
): number {
  if (quantity <= 0) {
    return 0;
  }

  const nextCost = nextHustleCost(
    definition,
    scaleCount,
    state,
    definitions,
    modifierContext
  );

  if (definition.growthRate === 1) {
    return nextCost * quantity;
  }

  return nextCost * ((definition.growthRate ** quantity - 1) / (definition.growthRate - 1));
}

export function maxAffordableQuantity(
  definition: HustleMechanicsDefinition,
  scaleCount: number,
  availableValuation: number,
  state?: GriftOsGameState,
  definitions?: GameMechanics,
  modifierContext?: ResolvedModifierContext
): number {
  if (availableValuation <= 0) {
    return 0;
  }

  const nextCost = nextHustleCost(
    definition,
    scaleCount,
    state,
    definitions,
    modifierContext
  );

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
    hustleCostForQuantity(
      definition,
      scaleCount,
      quantity,
      state,
      definitions,
      modifierContext
    ) > availableValuation
  ) {
    quantity -= 1;
  }

  while (
    hustleCostForQuantity(
      definition,
      scaleCount,
      quantity + 1,
      state,
      definitions,
      modifierContext
    ) <= availableValuation
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
  const modifierContext = resolveModifierContext(state, definitions);

  const quantityToBuy = quantity === 'max'
    ? maxAffordableQuantity(
        definition,
        hustle.scaleCount,
        state.valuation,
        state,
        definitions,
        modifierContext
      )
    : Math.max(0, Math.floor(quantity));
  const totalCost = hustleCostForQuantity(
    definition,
    hustle.scaleCount,
    quantityToBuy,
    state,
    definitions,
    modifierContext
  );

  if (quantityToBuy <= 0 || totalCost > state.valuation) {
    return {
      state,
      quantityPurchased: 0,
      totalCost: 0,
      milestonesReached: [],
    };
  }

  const nextScaleCount = hustle.scaleCount + quantityToBuy;
  const milestonesReached = newlyReachedMilestones(definition, hustle, nextScaleCount);
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
          scaleCount: nextScaleCount,
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
  hustleId: HustleId,
  modifierContext?: ResolvedModifierContext
): number {
  const definition = getHustleDefinition(definitions, hustleId);

  return applyAutomationCostModifiers(
    definition.automationCost,
    modifierBreakdownForHustle(state, definitions, hustleId, modifierContext)
  );
}

export function canBuyAutomation(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId,
  modifierContext?: ResolvedModifierContext
): boolean {
  const hustle = state.hustles[hustleId];

  return hustle.scaleCount > 0 &&
    !hustle.isAutomated &&
    state.valuation >= automationCost(state, definitions, hustleId, modifierContext);
}

export function buyAutomation(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): AutomationPurchaseResult {
  const hustle = state.hustles[hustleId];

  if (hustle.scaleCount <= 0 || hustle.isAutomated) {
    return {
      state,
      purchased: false,
      totalCost: 0,
    };
  }

  const modifierContext = resolveModifierContext(state, definitions);

  if (!canBuyAutomation(state, definitions, hustleId, modifierContext)) {
    return {
      state,
      purchased: false,
      totalCost: 0,
    };
  }

  const totalCost = automationCost(state, definitions, hustleId, modifierContext);
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

  if (hustle.scaleCount <= 0 || hustle.isActive) {
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
  hustleId: HustleId,
  modifierContext?: ResolvedModifierContext
): number {
  const definition = getHustleDefinition(definitions, hustleId);
  const hustle = state.hustles[hustleId];
  const basePayout = definition.basePayout * hustle.scaleCount;

  return applyOutputModifiers(
    basePayout,
    modifierBreakdownForHustle(state, definitions, hustleId, modifierContext)
  );
}

export function effectiveCadenceSeconds(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId,
  modifierContext?: ResolvedModifierContext
): number {
  const definition = getHustleDefinition(definitions, hustleId);

  return applyCadenceModifiers(
    definition.cadenceSeconds,
    modifierBreakdownForHustle(state, definitions, hustleId, modifierContext)
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
    const preparationRemainingMs = extractionPreparationRemainingMs(nextState, definitions);

    if (preparationRemainingMs !== null && preparationRemainingMs <= 0) {
      nextState = advanceExtractionPreparation(nextState, 0, definitions);
      continue;
    }

    const sliceMs = preparationRemainingMs === null
      ? remainingMs
      : Math.min(remainingMs, preparationRemainingMs);
    const advanced = advanceProduction(nextState, definitions, sliceMs);
    events.push(...advanced.events);
    nextState = advanceExtractionPreparation(advanced.state, sliceMs, definitions);
    remainingMs -= sliceMs;
  }

  return { state: nextState, events };
}

function advanceProduction(
  state: GriftOsGameState,
  definitions: GameMechanics,
  elapsedMs: number
): AdvanceResult {
  let modifierContext: ResolvedModifierContext | undefined;
  let valuation = state.valuation;
  const events: AdvanceResult['events'] = [];
  const hustles = { ...state.hustles };

  for (const definition of definitions) {
    const hustle = hustles[definition.id];

    if ((!hustle.isActive && !hustle.isAutomated) || hustle.scaleCount <= 0) {
      continue;
    }

    modifierContext ??= resolveModifierContext(state, definitions);

    const cadenceMs = effectiveCadenceSeconds(
      { ...state, hustles },
      definitions,
      definition.id,
      modifierContext
    ) * 1000;
    const nextProgress = hustle.progressMs + elapsedMs;

    if (nextProgress >= cadenceMs) {
      const cyclesCompleted = hustle.isAutomated
        ? Math.floor(nextProgress / cadenceMs)
        : 1;
      const payout = hustlePayout(
        { ...state, valuation, hustles },
        definitions,
        definition.id,
        modifierContext
      );
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
  definitions: GameMechanics,
  modifierContext?: ResolvedModifierContext
): number {
  let context = modifierContext;

  return definitions.reduce((total, definition) => {
    const hustle = state.hustles[definition.id];

    if (!hustle.isAutomated && !hustle.isActive) {
      return total;
    }

    context ??= resolveModifierContext(state, definitions);

    return total + hustlePayout(state, definitions, definition.id, context) /
      effectiveCadenceSeconds(state, definitions, definition.id, context);
  }, 0);
}

function newlyReachedMilestones(
  definition: HustleMechanicsDefinition,
  hustle: HustleState,
  nextScaleCount: number
): MilestoneReachedEvent[] {
  return definition.milestones
    .filter((milestone) =>
      nextScaleCount >= milestone.requiredScaleCount &&
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
export const generatorPayout = (definition: HustleMechanicsDefinition, scaleCount: number): number =>
  definition.basePayout * scaleCount;

function requireMechanics(mechanics?: GameMechanics): GameMechanics {
  if (!mechanics) {
    throw new Error('GriftOS mechanics are required when calculating modified values.');
  }

  return mechanics;
}
