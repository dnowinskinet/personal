import {
  activateHustle,
  advanceGame,
  automationCost,
  buyAutomation,
  buyHustle,
  createInitialGameState,
  hustleCostForQuantity,
  maxAffordableQuantity,
  nextHustleCost,
  valuationPerSecond,
} from './economy';
import { buyLeverage, canBuyLeverage, isLeverageUnlocked } from './leverage';
import {
  canStartExtractionPreparation,
  extractionRate,
  extractionStatus,
  startExtractionPreparation,
} from './extraction';
import { commitRugPull, createRugPullPreview } from './rug-pull';
import { GameMechanics, GameUnlock, HustleMechanicsDefinition } from './mechanics';
import {
  GriftOsGameState,
  HustleId,
  LeverageId,
  ProductionEvent,
} from './types';

export type BalanceStrategy =
  | 'natural'
  | 'automation-rush'
  | 'expansion-first'
  | 'next-hustle-rush'
  | 'milestone-rush'
  | 'rough-roi'
  | 'leverage-reinvestment';

export type BalanceProfileId =
  | 'active'
  | 'one-hour'
  | 'four-hour'
  | 'eight-hour'
  | 'morning-evening';

export type RugPullStrategy = 'immediate' | 'prepared' | 'deep';

export interface BalanceProfile {
  id: BalanceProfileId;
  label: string;
  returnIntervalMs: number;
  creditedIdleMs: number;
  activeSessionMs: number;
  activeStepMs: number;
}

export interface BalanceTimelineEntry {
  elapsedMs: number;
  collectionWindow: number;
  action: string;
  valuation: number;
  peakValuation: number;
  netWorth: number;
  valuationPerSecond: number;
  scaleCount: Partial<Record<HustleId, number>>;
  automated: HustleId[];
  milestones: string[];
  leverage: LeverageId[];
  extractionRate: number;
  extractionStages: number;
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
  mechanics: GameMechanics;
  durationMs?: number;
  stepMs?: number;
  startingNetWorth?: number;
}

export interface CampaignCollectionSummary {
  window: number;
  elapsedMs: number;
  creditedIdleMs: number;
  valuationCollected: number;
  purchases: readonly string[];
  valuationAfter: number;
  netWorthAfter: number;
}

export interface CampaignRugPullSummary {
  index: number;
  elapsedMs: number;
  collectionWindow: number;
  peakValuation: number;
  netWorthGained: number;
  resultingNetWorth: number;
  recoveryMs: number | null;
  newlyUnlocked: readonly GameUnlock[];
  extractionRate: number;
  extractionStages: number;
}

export interface CampaignTimingSummary {
  hustleRevealedAtMs: Partial<Record<HustleId, number>>;
  hustleAcquiredAtMs: Partial<Record<HustleId, number>>;
  automationAtMs: Partial<Record<HustleId, number>>;
  milestoneAtMs: Record<string, number>;
  leverageAtMs: Partial<Record<LeverageId, number>>;
  extractionAtMs: number[];
}

export interface CampaignSimulationResult {
  profile: BalanceProfile;
  strategy: BalanceStrategy;
  rugPullStrategy: RugPullStrategy;
  reachedTarget: boolean;
  campaignTargetNetWorth: number;
  simulatedMs: number;
  collectionWindows: number;
  finalState: GriftOsGameState;
  timeline: readonly BalanceTimelineEntry[];
  collections: readonly CampaignCollectionSummary[];
  rugPulls: readonly CampaignRugPullSummary[];
  timings: CampaignTimingSummary;
  productionByHustle: Record<HustleId, number>;
  productionShareByHustle: Record<HustleId, number>;
  purchaseCountByHustle: Record<HustleId, number>;
  dominantPurchaseShare: number;
}

export interface CampaignSimulationOptions {
  profile: BalanceProfileId | BalanceProfile;
  mechanics: GameMechanics;
  strategy?: BalanceStrategy;
  targetNetWorth?: number;
  maxWallClockMs?: number;
  startingNetWorth?: number;
  rugPullStrategy?: RugPullStrategy;
}

type PurchaseDecision =
  | { kind: 'hustle'; hustleId: HustleId; quantity: number | 'max' }
  | { kind: 'automation'; hustleId: HustleId }
  | { kind: 'leverage'; leverageId: LeverageId }
  | { kind: 'extraction' };

interface AppliedDecision {
  state: GriftOsGameState;
  action: string | null;
  hustleId: HustleId | null;
  automationId: HustleId | null;
  leverageId: LeverageId | null;
  extractionStarted: boolean;
  milestones: readonly string[];
}

interface PendingRecovery {
  rugIndex: number;
  committedAtMs: number;
  previousPeak: number;
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const OFFLINE_CAP_MS = 8 * HOUR_MS;
const DEFAULT_DURATION_MS = 30 * MINUTE_MS;
const DEFAULT_STEP_MS = 500;
const DEFAULT_CAMPAIGN_LIMIT_MS = 21 * 24 * HOUR_MS;

export const BALANCE_PROFILES: Readonly<Record<BalanceProfileId, BalanceProfile>> = {
  active: {
    id: 'active',
    label: 'Active continuous play',
    returnIntervalMs: 0,
    creditedIdleMs: 0,
    activeSessionMs: 10 * MINUTE_MS,
    activeStepMs: 1000,
  },
  'one-hour': {
    id: 'one-hour',
    label: 'Hourly returns',
    returnIntervalMs: HOUR_MS,
    creditedIdleMs: HOUR_MS,
    activeSessionMs: 6 * MINUTE_MS,
    activeStepMs: 1000,
  },
  'four-hour': {
    id: 'four-hour',
    label: 'Four-hour returns',
    returnIntervalMs: 4 * HOUR_MS,
    creditedIdleMs: 4 * HOUR_MS,
    activeSessionMs: 8 * MINUTE_MS,
    activeStepMs: 1000,
  },
  'eight-hour': {
    id: 'eight-hour',
    label: 'Repeated eight-hour returns',
    returnIntervalMs: 8 * HOUR_MS,
    creditedIdleMs: OFFLINE_CAP_MS,
    activeSessionMs: 10 * MINUTE_MS,
    activeStepMs: 1000,
  },
  'morning-evening': {
    id: 'morning-evening',
    label: 'Morning and evening check-ins',
    returnIntervalMs: 12 * HOUR_MS,
    creditedIdleMs: OFFLINE_CAP_MS,
    activeSessionMs: 10 * MINUTE_MS,
    activeStepMs: 1000,
  },
};

export function runBalanceSimulation(options: BalanceSimulationOptions): BalanceSimulationResult {
  const definitions = options.mechanics;
  const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;
  const stepMs = options.stepMs ?? DEFAULT_STEP_MS;
  let state = createInitialGameState(definitions, options.startingNetWorth ?? 0);
  const timeline: BalanceTimelineEntry[] = [createTimelineEntry(0, 0, 'start', state, definitions)];

  for (let elapsedMs = stepMs; elapsedMs <= durationMs; elapsedMs += stepMs) {
    state = activateManualHustles(state, definitions);
    state = advanceGame(state, definitions, stepMs).state;
    const applied = applyDecision(
      state,
      definitions,
      choosePurchase(state, definitions, options.strategy, 0, 'immediate')
    );
    state = applied.state;

    if (applied.action) {
      timeline.push(createTimelineEntry(elapsedMs, 0, applied.action, state, definitions));
    }
  }

  timeline.push(createTimelineEntry(durationMs, 0, 'end', state, definitions));

  return {
    strategy: options.strategy,
    simulatedMs: durationMs,
    finalState: state,
    timeline,
  };
}

export function runCampaignSimulation(options: CampaignSimulationOptions): CampaignSimulationResult {
  const definitions = options.mechanics;
  const profile = typeof options.profile === 'string' ? BALANCE_PROFILES[options.profile] : options.profile;
  const strategy = options.strategy ?? 'natural';
  const rugPullStrategy = options.rugPullStrategy ?? 'immediate';
  const targetNetWorth = options.targetNetWorth ?? definitions.prestige.campaignTargetNetWorth;
  const maxWallClockMs = options.maxWallClockMs ?? DEFAULT_CAMPAIGN_LIMIT_MS;
  let state = createInitialGameState(definitions, options.startingNetWorth ?? 0);
  let elapsedMs = 0;
  let collectionWindow = 0;
  let pendingRecovery: PendingRecovery | null = null;
  const timeline: BalanceTimelineEntry[] = [createTimelineEntry(0, 0, 'start', state, definitions)];
  const collections: CampaignCollectionSummary[] = [];
  const rugPulls: CampaignRugPullSummary[] = [];
  const productionByHustle = emptyHustleNumberRecord(definitions);
  const purchaseCountByHustle = emptyHustleNumberRecord(definitions);
  const timings: CampaignTimingSummary = {
    hustleRevealedAtMs: {},
    hustleAcquiredAtMs: {},
    automationAtMs: {},
    milestoneAtMs: {},
    leverageAtMs: {},
    extractionAtMs: [],
  };

  captureReveals(state, definitions, timings, elapsedMs);
  captureInitialOwnership(state, definitions, timings);

  while (elapsedMs < maxWallClockMs && state.netWorth < targetNetWorth) {
    const purchaseActions = new Map<string, number>();
    let creditedIdleMs = 0;
    let valuationCollected = 0;

    if (collectionWindow > 0 && profile.returnIntervalMs > 0) {
      const idleAdvanceMs = Math.min(profile.creditedIdleMs, OFFLINE_CAP_MS);
      const valuationBefore = state.valuation;
      state = prepareIdleState(state, definitions);
      const advanced = advanceGame(state, definitions, idleAdvanceMs);
      state = advanced.state;
      collectProduction(advanced.events, productionByHustle);
      creditedIdleMs = idleAdvanceMs;
      valuationCollected = Math.max(0, state.valuation - valuationBefore);
      elapsedMs += profile.returnIntervalMs;

      const rugResult = applyRugPullIfReady(
        state,
        definitions,
        elapsedMs,
        collectionWindow,
        rugPulls,
        timeline,
        rugPullStrategy
      );
      state = rugResult.state;
      pendingRecovery = rugResult.pendingRecovery ?? pendingRecovery;
      captureReveals(state, definitions, timings, elapsedMs);
    }

    const sessionEndMs = Math.min(maxWallClockMs, elapsedMs + profile.activeSessionMs);

    while (elapsedMs < sessionEndMs && state.netWorth < targetNetWorth) {
      const stepMs = Math.min(profile.activeStepMs, sessionEndMs - elapsedMs);
      state = activateManualHustles(state, definitions);
      const advanced = advanceGame(state, definitions, stepMs);
      state = advanced.state;
      elapsedMs += stepMs;
      collectProduction(advanced.events, productionByHustle);

      const rugResult = applyRugPullIfReady(
        state,
        definitions,
        elapsedMs,
        collectionWindow,
        rugPulls,
        timeline,
        rugPullStrategy
      );
      state = rugResult.state;

      if (rugResult.pendingRecovery) {
        pendingRecovery = rugResult.pendingRecovery;
        captureReveals(state, definitions, timings, elapsedMs);
        continue;
      }

      pendingRecovery = captureRecovery(state, pendingRecovery, rugPulls, elapsedMs);

      const decision = choosePurchase(
        state,
        definitions,
        strategy,
        profile.returnIntervalMs,
        rugPullStrategy
      );
      const applied = applyDecision(state, definitions, decision);
      state = applied.state;

      if (applied.action) {
        purchaseActions.set(applied.action, (purchaseActions.get(applied.action) ?? 0) + 1);
        const isFirstAcquisition = applied.hustleId !== null &&
          timings.hustleAcquiredAtMs[applied.hustleId] === undefined;
        const isTimelineEvent = isFirstAcquisition ||
          applied.automationId !== null ||
          applied.leverageId !== null ||
          applied.extractionStarted ||
          applied.milestones.length > 0;

        if (isTimelineEvent) {
          timeline.push(createTimelineEntry(elapsedMs, collectionWindow, applied.action, state, definitions));
        }

        captureAppliedDecision(applied, timings, purchaseCountByHustle, elapsedMs);
      }
    }

    collections.push({
      window: collectionWindow,
      elapsedMs,
      creditedIdleMs,
      valuationCollected,
      purchases: summarizePurchaseActions(purchaseActions),
      valuationAfter: state.valuation,
      netWorthAfter: state.netWorth,
    });

    if (profile.returnIntervalMs === 0 && elapsedMs >= maxWallClockMs) {
      break;
    }

    collectionWindow += 1;
  }

  const totalProduction = Object.values(productionByHustle).reduce((total, value) => total + value, 0);
  const productionShareByHustle = mapHustleNumbers(
    productionByHustle,
    (value) => totalProduction > 0 ? value / totalProduction : 0
  );
  const totalHustlePurchases = Object.values(purchaseCountByHustle)
    .reduce((total, value) => total + value, 0);
  const dominantPurchaseShare = totalHustlePurchases > 0
    ? Math.max(...Object.values(purchaseCountByHustle)) / totalHustlePurchases
    : 0;

  timeline.push(createTimelineEntry(elapsedMs, collectionWindow, 'end', state, definitions));

  return {
    profile,
    strategy,
    rugPullStrategy,
    reachedTarget: state.netWorth >= targetNetWorth,
    campaignTargetNetWorth: targetNetWorth,
    simulatedMs: elapsedMs,
    collectionWindows: collections.filter((collection) => collection.creditedIdleMs > 0).length,
    finalState: state,
    timeline,
    collections,
    rugPulls,
    timings,
    productionByHustle,
    productionShareByHustle,
    purchaseCountByHustle,
    dominantPurchaseShare,
  };
}

function choosePurchase(
  state: GriftOsGameState,
  definitions: GameMechanics,
  strategy: BalanceStrategy,
  expectedReturnMs: number,
  rugPullStrategy: RugPullStrategy
): PurchaseDecision | null {
  const extractionDecision = extractionPreparationDecision(state, definitions, rugPullStrategy);

  if (extractionDecision !== undefined) {
    return extractionDecision;
  }

  switch (strategy) {
    case 'automation-rush':
      return firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        bestRoiExpansion(state, definitions);
    case 'expansion-first':
      return nextMilestonePurchase(state, definitions) ??
        bestRoiExpansion(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        firstAffordableAutomation(state, definitions);
    case 'next-hustle-rush':
      return firstAffordableUnowned(state, definitions) ??
        firstAffordableAutomation(state, definitions) ??
        bestRoiExpansion(state, definitions);
    case 'milestone-rush':
      return nextMilestonePurchase(state, definitions) ??
        firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        bestRoiExpansion(state, definitions);
    case 'rough-roi':
      return bestRoiDecision(state, definitions);
    case 'leverage-reinvestment':
      return firstAffordableLeverage(state, definitions) ??
        firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        bestRoiExpansion(state, definitions);
    case 'natural':
      return firstAffordableAutomation(state, definitions) ??
        firstAffordableUnowned(state, definitions) ??
        (
          shouldSaveForStructuralPurchase(state, definitions, expectedReturnMs)
            ? null
            : nextMilestonePurchase(state, definitions) ?? bestRoiExpansion(state, definitions)
        );
  }
}

function extractionPreparationDecision(
  state: GriftOsGameState,
  definitions: GameMechanics,
  rugPullStrategy: RugPullStrategy
): PurchaseDecision | null | undefined {
  const desiredStages = rugPullStrategy === 'immediate' ? 0 : rugPullStrategy === 'prepared' ? 1 : 2;
  const status = extractionStatus(state, definitions);

  if (
    desiredStages <= status.completedStages ||
    status.isPreparing ||
    state.peakValuation < createRugPullPreview(state, definitions).requiredPeakValuation
  ) {
    return undefined;
  }

  return canStartExtractionPreparation(state, definitions) ? { kind: 'extraction' } : null;
}

function shouldSaveForStructuralPurchase(
  state: GriftOsGameState,
  definitions: GameMechanics,
  expectedReturnMs: number
): boolean {
  const rugPreview = createRugPullPreview(state, definitions);
  const automatedRate = automatedPortfolioRate(state, definitions);
  const savingsPolicy = savingsPolicyForReturn(expectedReturnMs);

  if (!rugPreview.isAvailable) {
    const rugShortfall = Math.max(0, rugPreview.requiredPeakValuation - state.valuation);
    const secondsToRug = rugShortfall / Math.max(1, automatedRate);

    if (
      state.valuation >= rugPreview.requiredPeakValuation * savingsPolicy.rugBalanceRatio ||
      secondsToRug <= savingsPolicy.rugHorizonMs / 1000
    ) {
      return true;
    }
  }

  const structuralCosts = definitions.flatMap((definition) => {
    const hustle = state.hustles[definition.id];

    if (hustle.scaleCount === 0) {
      return [nextHustleCost(definition, 0, state, definitions)];
    }

    if (hustle.scaleCount > 0 && !hustle.isAutomated) {
      return [automationCost(state, definitions, definition.id)];
    }

    return [];
  });

  const nextCost = structuralCosts
    .filter((cost) => cost > state.valuation)
    .sort((first, second) => first - second)[0];

  if (nextCost === undefined) {
    return false;
  }

  if (state.valuation >= nextCost * savingsPolicy.structuralBalanceRatio) {
    return true;
  }

  const secondsToGoal = (nextCost - state.valuation) / Math.max(1, automatedRate);

  return secondsToGoal <= savingsPolicy.structuralHorizonMs / 1000;
}

function savingsPolicyForReturn(expectedReturnMs: number): {
  rugBalanceRatio: number;
  rugHorizonMs: number;
  structuralBalanceRatio: number;
  structuralHorizonMs: number;
} {
  if (expectedReturnMs <= 0) {
    return {
      rugBalanceRatio: 0.45,
      rugHorizonMs: 2 * HOUR_MS,
      structuralBalanceRatio: 0.12,
      structuralHorizonMs: 4 * HOUR_MS,
    };
  }

  if (expectedReturnMs <= HOUR_MS) {
    return {
      rugBalanceRatio: 0.45,
      rugHorizonMs: 2 * HOUR_MS,
      structuralBalanceRatio: 0.12,
      structuralHorizonMs: 16 * HOUR_MS,
    };
  }

  if (expectedReturnMs <= 4 * HOUR_MS) {
    return {
      rugBalanceRatio: 0.65,
      rugHorizonMs: HOUR_MS,
      structuralBalanceRatio: 0.25,
      structuralHorizonMs: 8 * HOUR_MS,
    };
  }

  return {
    rugBalanceRatio: 1.1,
    rugHorizonMs: 0,
    structuralBalanceRatio: 1.1,
    structuralHorizonMs: 0,
  };
}

function firstAffordableAutomation(
  state: GriftOsGameState,
  definitions: GameMechanics
): PurchaseDecision | null {
  const candidate = [...definitions]
    .reverse()
    .find((definition) => {
      const hustle = state.hustles[definition.id];

      return hustle.scaleCount > 0 &&
        !hustle.isAutomated &&
        state.valuation >= automationCost(state, definitions, definition.id);
    });

  return candidate ? { kind: 'automation', hustleId: candidate.id } : null;
}

function firstAffordableLeverage(
  state: GriftOsGameState,
  definitions: GameMechanics
): PurchaseDecision | null {
  const candidate = definitions.leverage.find((definition) =>
    canBuyLeverage(state, definition.id, definitions)
  );

  return candidate ? { kind: 'leverage', leverageId: candidate.id } : null;
}

function firstAffordableUnowned(
  state: GriftOsGameState,
  definitions: GameMechanics
): PurchaseDecision | null {
  const candidate = definitions.find((definition) =>
    state.hustles[definition.id].scaleCount === 0 &&
    state.valuation >= nextHustleCost(definition, 0, state, definitions)
  );

  return candidate ? { kind: 'hustle', hustleId: candidate.id, quantity: 1 } : null;
}

function nextMilestonePurchase(
  state: GriftOsGameState,
  definitions: GameMechanics
): PurchaseDecision | null {
  const candidates = definitions.flatMap((definition) => {
    const hustle = state.hustles[definition.id];
    const nextMilestone = definition.milestones.find((milestone) =>
      !hustle.reachedMilestones.includes(milestone.id) && milestone.requiredScaleCount > hustle.scaleCount
    );

    if (!nextMilestone || hustle.scaleCount <= 0) {
      return [];
    }

    const quantity = nextMilestone.requiredScaleCount - hustle.scaleCount;
    const cost = hustleCostForQuantity(definition, hustle.scaleCount, quantity, state, definitions);

    if (cost > state.valuation) {
      return [];
    }

    const purchased = buyHustle(state, definitions, definition.id, quantity);
    const beforeRate = hustleRate(state, definitions, definition.id);
    const afterRate = hustleRate(purchased.state, definitions, definition.id);

    return [{
      decision: { kind: 'hustle', hustleId: definition.id, quantity } as PurchaseDecision,
      score: (afterRate - beforeRate) / Math.max(1, cost),
    }];
  });

  return candidates.sort((first, second) => second.score - first.score)[0]?.decision ?? null;
}

function bestRoiExpansion(
  state: GriftOsGameState,
  definitions: GameMechanics
): PurchaseDecision | null {
  const candidate = definitions
    .filter((definition) => state.hustles[definition.id].scaleCount > 0)
    .map((definition) => {
      const scaleCount = state.hustles[definition.id].scaleCount;
      const cost = nextHustleCost(definition, scaleCount, state, definitions);
      const purchased = buyHustle(state, definitions, definition.id, 1);

      return {
        definition,
        cost,
        score: (
          hustleRate(purchased.state, definitions, definition.id) -
          hustleRate(state, definitions, definition.id)
        ) / Math.max(1, cost),
      };
    })
    .filter((candidate) => candidate.cost <= state.valuation)
    .sort((first, second) => second.score - first.score)[0];

  return candidate ? { kind: 'hustle', hustleId: candidate.definition.id, quantity: 1 } : null;
}

function bestRoiDecision(
  state: GriftOsGameState,
  definitions: GameMechanics
): PurchaseDecision | null {
  const candidates: { decision: PurchaseDecision; score: number }[] = [];
  const expansion = bestRoiExpansion(state, definitions);

  if (expansion?.kind === 'hustle') {
    const definition = definitionFor(definitions, expansion.hustleId);
    const cost = nextHustleCost(
      definition,
      state.hustles[expansion.hustleId].scaleCount,
      state,
      definitions
    );
    const purchased = buyHustle(state, definitions, expansion.hustleId, 1);
    candidates.push({
      decision: expansion,
      score: (
        hustleRate(purchased.state, definitions, expansion.hustleId) -
        hustleRate(state, definitions, expansion.hustleId)
      ) / Math.max(1, cost),
    });
  }

  for (const definition of definitions) {
    const hustle = state.hustles[definition.id];

    if (
      hustle.scaleCount === 0 &&
      state.valuation >= nextHustleCost(definition, 0, state, definitions)
    ) {
      candidates.push({
        decision: { kind: 'hustle', hustleId: definition.id, quantity: 1 },
        score: hustleRateForScale(state, definitions, definition.id, 1) /
          Math.max(1, nextHustleCost(definition, 0, state, definitions)),
      });
    }

    if (
      hustle.scaleCount > 0 &&
      !hustle.isAutomated &&
      state.valuation >= automationCost(state, definitions, definition.id)
    ) {
      candidates.push({
        decision: { kind: 'automation', hustleId: definition.id },
        score: hustleRate(state, definitions, definition.id) /
          Math.max(1, automationCost(state, definitions, definition.id)),
      });
    }
  }

  return candidates.sort((first, second) => second.score - first.score)[0]?.decision ?? null;
}

function applyDecision(
  state: GriftOsGameState,
  definitions: GameMechanics,
  decision: PurchaseDecision | null
): AppliedDecision {
  if (!decision) {
    return emptyAppliedDecision(state);
  }

  if (decision.kind === 'extraction') {
    const stage = extractionStatus(state, definitions).nextStage;
    const result = startExtractionPreparation(state, definitions);

    return result.started
      ? {
          state: result.state,
          action: `prepare extraction ${stage?.id ?? 'stage'}`,
          hustleId: null,
          automationId: null,
          leverageId: null,
          extractionStarted: true,
          milestones: [],
        }
      : emptyAppliedDecision(state);
  }

  if (decision.kind === 'automation') {
    const result = buyAutomation(state, definitions, decision.hustleId);

    return result.purchased
      ? {
          state: result.state,
          action: `automate ${decision.hustleId}`,
          hustleId: null,
          automationId: decision.hustleId,
          leverageId: null,
          extractionStarted: false,
          milestones: [],
        }
      : emptyAppliedDecision(state);
  }

  if (decision.kind === 'leverage') {
    const result = buyLeverage(state, decision.leverageId, definitions);

    return result.purchased
      ? {
          state: result.state,
          action: `leverage ${decision.leverageId}`,
          hustleId: null,
          automationId: null,
          leverageId: decision.leverageId,
          extractionStarted: false,
          milestones: [],
        }
      : emptyAppliedDecision(state);
  }

  const beforeScaleCount = state.hustles[decision.hustleId].scaleCount;
  const result = buyHustle(state, definitions, decision.hustleId, decision.quantity);

  return result.quantityPurchased > 0
    ? {
        state: result.state,
        action: `${beforeScaleCount === 0 ? 'acquire' : 'expand'} ${decision.hustleId} x${result.quantityPurchased}`,
        hustleId: decision.hustleId,
        automationId: null,
        leverageId: null,
        extractionStarted: false,
        milestones: result.milestonesReached.map((event) => event.milestoneId),
      }
    : emptyAppliedDecision(state);
}

function applyRugPullIfReady(
  state: GriftOsGameState,
  definitions: GameMechanics,
  elapsedMs: number,
  collectionWindow: number,
  rugPulls: CampaignRugPullSummary[],
  timeline: BalanceTimelineEntry[],
  rugPullStrategy: RugPullStrategy
): { state: GriftOsGameState; pendingRecovery: PendingRecovery | null } {
  const preview = createRugPullPreview(state, definitions);

  if (!preview.isAvailable || !shouldCommitRugPull(state, preview.requiredPeakValuation, rugPullStrategy)) {
    return { state, pendingRecovery: null };
  }

  const previousPeak = state.peakValuation;
  const takeRate = extractionRate(state, definitions);
  const takeStages = state.extractionPreparation.completedStages;
  const result = commitRugPull(state, definitions);
  const rugIndex = rugPulls.length;
  rugPulls.push({
    index: rugIndex + 1,
    elapsedMs,
    collectionWindow,
    peakValuation: previousPeak,
    netWorthGained: result.netWorthGained,
    resultingNetWorth: result.state.netWorth,
    recoveryMs: null,
    newlyUnlocked: preview.newlyUnlocked,
    extractionRate: takeRate,
    extractionStages: takeStages,
  });
  timeline.push(createTimelineEntry(
    elapsedMs,
    collectionWindow,
    `rug pull +${result.netWorthGained}`,
    result.state,
    definitions
  ));

  return {
    state: result.state,
    pendingRecovery: {
      rugIndex,
      committedAtMs: elapsedMs,
      previousPeak,
    },
  };
}

function shouldCommitRugPull(
  state: GriftOsGameState,
  requiredPeakValuation: number,
  strategy: RugPullStrategy
): boolean {
  if (state.extractionPreparation.isActive) {
    return false;
  }

  if (strategy === 'immediate') {
    return true;
  }

  if (strategy === 'prepared') {
    return state.extractionPreparation.completedStages >= 1;
  }

  return state.extractionPreparation.completedStages >= 2 &&
    state.peakValuation >= requiredPeakValuation * 2;
}

function captureRecovery(
  state: GriftOsGameState,
  pending: PendingRecovery | null,
  rugPulls: CampaignRugPullSummary[],
  elapsedMs: number
): PendingRecovery | null {
  if (!pending || state.peakValuation < pending.previousPeak) {
    return pending;
  }

  rugPulls[pending.rugIndex] = {
    ...rugPulls[pending.rugIndex],
    recoveryMs: elapsedMs - pending.committedAtMs,
  };

  return null;
}

function captureAppliedDecision(
  applied: AppliedDecision,
  timings: CampaignTimingSummary,
  purchaseCounts: Record<HustleId, number>,
  elapsedMs: number
): void {
  if (applied.hustleId) {
    purchaseCounts[applied.hustleId] += 1;

    if (timings.hustleAcquiredAtMs[applied.hustleId] === undefined) {
      timings.hustleAcquiredAtMs[applied.hustleId] = elapsedMs;
    }
  }

  if (applied.automationId && timings.automationAtMs[applied.automationId] === undefined) {
    timings.automationAtMs[applied.automationId] = elapsedMs;
  }

  if (applied.leverageId && timings.leverageAtMs[applied.leverageId] === undefined) {
    timings.leverageAtMs[applied.leverageId] = elapsedMs;
  }

  if (applied.extractionStarted) {
    timings.extractionAtMs.push(elapsedMs);
  }

  for (const milestoneId of applied.milestones) {
    timings.milestoneAtMs[milestoneId] ??= elapsedMs;
  }
}

function captureReveals(
  state: GriftOsGameState,
  definitions: GameMechanics,
  timings: CampaignTimingSummary,
  elapsedMs: number
): void {
  for (const definition of definitions) {
    if (
      state.peakNetWorth >= definition.unlockNetWorth &&
      timings.hustleRevealedAtMs[definition.id] === undefined
    ) {
      timings.hustleRevealedAtMs[definition.id] = elapsedMs;
    }
  }
}

function captureInitialOwnership(
  state: GriftOsGameState,
  definitions: GameMechanics,
  timings: CampaignTimingSummary
): void {
  for (const definition of definitions) {
    if (state.hustles[definition.id].scaleCount > 0) {
      timings.hustleAcquiredAtMs[definition.id] = 0;
    }
  }
}

function activateManualHustles(
  state: GriftOsGameState,
  definitions: GameMechanics
): GriftOsGameState {
  let nextState = state;

  for (const definition of definitions) {
    const hustle = nextState.hustles[definition.id];

    if (hustle.scaleCount > 0 && !hustle.isActive && !hustle.isAutomated) {
      nextState = activateHustle(nextState, definition.id);
    }
  }

  return nextState;
}

function prepareIdleState(
  state: GriftOsGameState,
  definitions: GameMechanics
): GriftOsGameState {
  return {
    ...state,
    hustles: Object.fromEntries(definitions.map((definition) => {
      const hustle = state.hustles[definition.id];

      return [definition.id, hustle.isAutomated
        ? hustle
        : { ...hustle, isActive: false, progressMs: 0 }];
    })) as Record<HustleId, GriftOsGameState['hustles'][HustleId]>,
  };
}

function collectProduction(
  events: readonly ProductionEvent[],
  production: Record<HustleId, number>
): void {
  for (const event of events) {
    production[event.hustleId] += event.payout * event.cyclesCompleted;
  }
}

function hustleRate(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): number {
  const activeState = activateHustle(state, hustleId);

  return valuationPerSecond(
    activeState,
    mechanicsSubset(definitions, definitionFor(definitions, hustleId))
  );
}

function hustleRateForScale(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId,
  scaleCount: number
): number {
  const hypothetical = {
    ...state,
    hustles: {
      ...state.hustles,
      [hustleId]: {
        ...state.hustles[hustleId],
        scaleCount,
        isActive: true,
      },
    },
  };

  return valuationPerSecond(
    hypothetical,
    mechanicsSubset(definitions, definitionFor(definitions, hustleId))
  );
}

function fullPortfolioRate(
  state: GriftOsGameState,
  definitions: GameMechanics
): number {
  return definitions.reduce(
    (total, definition) => total + hustleRate(state, definitions, definition.id),
    0
  );
}

function automatedPortfolioRate(
  state: GriftOsGameState,
  definitions: GameMechanics
): number {
  const automatedState = {
    ...state,
    hustles: Object.fromEntries(definitions.map((definition) => {
      const hustle = state.hustles[definition.id];

      return [definition.id, hustle.isAutomated
        ? hustle
        : { ...hustle, isActive: false, progressMs: 0 }];
    })) as Record<HustleId, GriftOsGameState['hustles'][HustleId]>,
  };

  return valuationPerSecond(automatedState, definitions);
}

function definitionFor(
  definitions: GameMechanics,
  hustleId: HustleId
): HustleMechanicsDefinition {
  const definition = definitions.find((candidate) => candidate.id === hustleId);

  if (!definition) {
    throw new Error(`Unknown simulated Hustle: ${hustleId}`);
  }

  return definition;
}

function mechanicsSubset(
  mechanics: GameMechanics,
  definition: HustleMechanicsDefinition
): GameMechanics {
  return Object.assign([definition], {
    leverage: mechanics.leverage,
    campaignStrata: mechanics.campaignStrata,
    prestige: mechanics.prestige,
    extraction: mechanics.extraction,
  });
}

function emptyAppliedDecision(state: GriftOsGameState): AppliedDecision {
  return {
    state,
    action: null,
    hustleId: null,
    automationId: null,
    leverageId: null,
    extractionStarted: false,
    milestones: [],
  };
}

function createTimelineEntry(
  elapsedMs: number,
  collectionWindow: number,
  action: string,
  state: GriftOsGameState,
  definitions: GameMechanics
): BalanceTimelineEntry {
  return {
    elapsedMs,
    collectionWindow,
    action,
    valuation: state.valuation,
    peakValuation: state.peakValuation,
    netWorth: state.netWorth,
    valuationPerSecond: valuationPerSecond(state, definitions),
    scaleCount: Object.fromEntries(
      definitions.map((definition) => [definition.id, state.hustles[definition.id].scaleCount])
    ),
    automated: definitions
      .filter((definition) => state.hustles[definition.id].isAutomated)
      .map((definition) => definition.id),
    milestones: definitions.flatMap((definition) => state.hustles[definition.id].reachedMilestones),
    leverage: [...state.leveragePurchases],
    extractionRate: extractionRate(state, definitions),
    extractionStages: state.extractionPreparation.completedStages,
    rugPullAvailable: createRugPullPreview(state, definitions).isAvailable,
  };
}

function emptyHustleNumberRecord(
  definitions: GameMechanics
): Record<HustleId, number> {
  return Object.fromEntries(definitions.map((definition) => [definition.id, 0])) as Record<HustleId, number>;
}

function mapHustleNumbers(
  values: Record<HustleId, number>,
  mapper: (value: number, hustleId: HustleId) => number
): Record<HustleId, number> {
  return Object.fromEntries(
    Object.entries(values).map(([hustleId, value]) => [
      hustleId,
      mapper(value, hustleId as HustleId),
    ])
  ) as Record<HustleId, number>;
}

function summarizePurchaseActions(actions: ReadonlyMap<string, number>): string[] {
  return [...actions.entries()].map(([action, count]) => count > 1 ? `${action} (${count} times)` : action);
}

export function affordableMilestoneQuantity(
  state: GriftOsGameState,
  definitions: GameMechanics,
  hustleId: HustleId
): number {
  const definition = definitionFor(definitions, hustleId);

  return maxAffordableQuantity(
    definition,
    state.hustles[hustleId].scaleCount,
    state.valuation,
    state,
    definitions
  );
}

export function structurallyAvailableLeverage(
  state: GriftOsGameState,
  mechanics: GameMechanics
): readonly LeverageId[] {
  return mechanics.leverage
    .filter((definition) => isLeverageUnlocked(state, definition))
    .map((definition) => definition.id);
}
