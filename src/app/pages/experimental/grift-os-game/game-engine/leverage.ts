import { LEVERAGE_DEFINITIONS } from '../content/leverage-definitions';
import {
  GriftOsGameState,
  HustleId,
  LeverageDefinition,
  LeverageId,
  LeveragePurchaseResult,
} from './types';

export interface LeverageRequirements {
  netWorthRequired: number;
  missingOwnedHustles: readonly HustleId[];
  missingAutomatedHustles: readonly HustleId[];
}

export function getLeverageDefinition(leverageId: LeverageId): LeverageDefinition {
  const definition = LEVERAGE_DEFINITIONS.find((candidate) => candidate.id === leverageId);

  if (!definition) {
    throw new Error(`Unknown GriftOS Leverage deal: ${leverageId}`);
  }

  return definition;
}

export function isLeverageUnlocked(
  state: GriftOsGameState,
  definition: LeverageDefinition
): boolean {
  const requirements = leverageRequirements(state, definition);

  return requirements.netWorthRequired <= 0 &&
    requirements.missingOwnedHustles.length === 0 &&
    requirements.missingAutomatedHustles.length === 0;
}

export function canBuyLeverage(
  state: GriftOsGameState,
  leverageId: LeverageId
): boolean {
  const definition = getLeverageDefinition(leverageId);

  return !state.leveragePurchases.includes(leverageId) &&
    isLeverageUnlocked(state, definition) &&
    state.valuation >= definition.cost;
}

export function buyLeverage(
  state: GriftOsGameState,
  leverageId: LeverageId
): LeveragePurchaseResult {
  const definition = getLeverageDefinition(leverageId);

  if (!canBuyLeverage(state, leverageId)) {
    return { state, purchased: false, totalCost: 0 };
  }

  return {
    state: {
      ...state,
      valuation: Math.max(0, state.valuation - definition.cost),
      leveragePurchases: [...state.leveragePurchases, leverageId],
    },
    purchased: true,
    totalCost: definition.cost,
  };
}

export function leverageRequirements(
  state: GriftOsGameState,
  definition: LeverageDefinition
): LeverageRequirements {
  return {
    netWorthRequired: Math.max(0, definition.unlockNetWorth - state.netWorth),
    missingOwnedHustles: definition.requiredOwnedHustles
      .filter((hustleId) => state.hustles[hustleId].units <= 0),
    missingAutomatedHustles: definition.requiredAutomatedHustles
      .filter((hustleId) => !state.hustles[hustleId].isAutomated),
  };
}
