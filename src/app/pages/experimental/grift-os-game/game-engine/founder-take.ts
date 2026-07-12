import { FounderTakeStageMechanics, GameMechanics } from './mechanics';
import { rugPullTargetForNetWorth } from './progression';
import {
  FounderTakePreparationResult,
  GriftOsGameState,
} from './types';

export interface FounderTakeStatus {
  takeRate: number;
  completedStages: number;
  isPreparing: boolean;
  activeStage: FounderTakeStageMechanics | null;
  nextStage: FounderTakeStageMechanics | null;
  nextStageCost: number;
  progressMs: number;
  remainingMs: number;
  outputRetention: number;
  canStartNextStage: boolean;
}

export function founderTakeRate(state: GriftOsGameState, mechanics: GameMechanics): number {
  const completedStages = safeCompletedStages(state, mechanics);
  const completedBonus = mechanics.founderTake.stages
    .slice(0, completedStages)
    .reduce((total, stage) => total + stage.takeBonus, 0);

  return mechanics.founderTake.baseTake + completedBonus;
}

export function founderTakeStatus(
  state: GriftOsGameState,
  mechanics: GameMechanics
): FounderTakeStatus {
  const completedStages = safeCompletedStages(state, mechanics);
  const activeStage = state.founderTakePreparation.isActive
    ? mechanics.founderTake.stages[completedStages] ?? null
    : null;
  const nextStage = mechanics.founderTake.stages[completedStages] ?? null;
  const nextStageCost = nextStage ? founderTakeStageCost(state, mechanics, nextStage) : 0;
  const remainingMs = activeStage
    ? Math.max(0, activeStage.durationMs - state.founderTakePreparation.progressMs)
    : 0;

  return {
    takeRate: founderTakeRate(state, mechanics),
    completedStages,
    isPreparing: activeStage !== null,
    activeStage,
    nextStage,
    nextStageCost,
    progressMs: state.founderTakePreparation.progressMs,
    remainingMs,
    outputRetention: activeStage?.outputRetention ?? 1,
    canStartNextStage: canStartFounderTakePreparation(state, mechanics),
  };
}

export function founderTakeStageCost(
  state: GriftOsGameState,
  mechanics: GameMechanics,
  stage?: FounderTakeStageMechanics | null
): number {
  const targetStage = stage ?? nextFounderTakeStage(state, mechanics);

  if (!targetStage) {
    return 0;
  }

  return rugPullTargetForNetWorth(state.netWorth, mechanics) * targetStage.costTargetRatio;
}

export function nextFounderTakeStage(
  state: GriftOsGameState,
  mechanics: GameMechanics
): FounderTakeStageMechanics | null {
  return mechanics.founderTake.stages[safeCompletedStages(state, mechanics)] ?? null;
}

export function canStartFounderTakePreparation(
  state: GriftOsGameState,
  mechanics: GameMechanics
): boolean {
  const stage = nextFounderTakeStage(state, mechanics);

  return stage !== null &&
    !state.founderTakePreparation.isActive &&
    state.peakValuation >= rugPullTargetForNetWorth(state.netWorth, mechanics) &&
    state.valuation >= founderTakeStageCost(state, mechanics, stage);
}

export function startFounderTakePreparation(
  state: GriftOsGameState,
  mechanics: GameMechanics
): FounderTakePreparationResult {
  const stage = nextFounderTakeStage(state, mechanics);

  if (!stage || !canStartFounderTakePreparation(state, mechanics)) {
    return { state, started: false, totalCost: 0 };
  }

  const totalCost = founderTakeStageCost(state, mechanics, stage);

  return {
    state: {
      ...state,
      valuation: Math.max(0, state.valuation - totalCost),
      founderTakePreparation: {
        ...state.founderTakePreparation,
        isActive: true,
        progressMs: 0,
      },
    },
    started: true,
    totalCost,
  };
}

export function founderTakePreparationRemainingMs(
  state: GriftOsGameState,
  mechanics: GameMechanics
): number | null {
  if (!state.founderTakePreparation.isActive) {
    return null;
  }

  const stage = nextFounderTakeStage(state, mechanics);

  return stage
    ? Math.max(0, stage.durationMs - state.founderTakePreparation.progressMs)
    : 0;
}

export function advanceFounderTakePreparation(
  state: GriftOsGameState,
  elapsedMs: number,
  mechanics: GameMechanics
): GriftOsGameState {
  if (!state.founderTakePreparation.isActive) {
    return state;
  }

  const stage = nextFounderTakeStage(state, mechanics);

  if (!stage) {
    return {
      ...state,
      founderTakePreparation: {
        completedStages: mechanics.founderTake.stages.length,
        isActive: false,
        progressMs: 0,
      },
    };
  }

  const progressMs = state.founderTakePreparation.progressMs + Math.max(0, elapsedMs);

  if (progressMs < stage.durationMs) {
    return {
      ...state,
      founderTakePreparation: {
        ...state.founderTakePreparation,
        progressMs,
      },
    };
  }

  return {
    ...state,
    founderTakePreparation: {
      completedStages: Math.min(
        mechanics.founderTake.stages.length,
        safeCompletedStages(state, mechanics) + 1
      ),
      isActive: false,
      progressMs: 0,
    },
  };
}

export function founderTakeOutputRetention(
  state: GriftOsGameState,
  mechanics: GameMechanics
): number {
  return founderTakeStatus(state, mechanics).outputRetention;
}

function safeCompletedStages(state: GriftOsGameState, mechanics: GameMechanics): number {
  return Math.min(
    mechanics.founderTake.stages.length,
    Math.max(0, Math.floor(state.founderTakePreparation.completedStages))
  );
}
