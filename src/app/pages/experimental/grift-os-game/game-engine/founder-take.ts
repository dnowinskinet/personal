import {
  FounderTakeStageTuning,
  GRIFT_OS_FOUNDER_TAKE_TUNING,
} from '../content/economy-tuning';
import { rugPullTargetForNetWorth } from './progression';
import {
  FounderTakePreparationResult,
  GriftOsGameState,
} from './types';

export interface FounderTakeStatus {
  takeRate: number;
  completedStages: number;
  isPreparing: boolean;
  activeStage: FounderTakeStageTuning | null;
  nextStage: FounderTakeStageTuning | null;
  nextStageCost: number;
  progressMs: number;
  remainingMs: number;
  outputRetention: number;
  canStartNextStage: boolean;
}

export function founderTakeRate(state: GriftOsGameState): number {
  const completedStages = safeCompletedStages(state);
  const completedBonus = GRIFT_OS_FOUNDER_TAKE_TUNING.stages
    .slice(0, completedStages)
    .reduce((total, stage) => total + stage.takeBonus, 0);

  return GRIFT_OS_FOUNDER_TAKE_TUNING.baseTake + completedBonus;
}

export function founderTakeStatus(state: GriftOsGameState): FounderTakeStatus {
  const completedStages = safeCompletedStages(state);
  const activeStage = state.founderTakePreparation.isActive
    ? GRIFT_OS_FOUNDER_TAKE_TUNING.stages[completedStages] ?? null
    : null;
  const nextStage = GRIFT_OS_FOUNDER_TAKE_TUNING.stages[completedStages] ?? null;
  const nextStageCost = nextStage ? founderTakeStageCost(state, nextStage) : 0;
  const remainingMs = activeStage
    ? Math.max(0, activeStage.durationMs - state.founderTakePreparation.progressMs)
    : 0;

  return {
    takeRate: founderTakeRate(state),
    completedStages,
    isPreparing: activeStage !== null,
    activeStage,
    nextStage,
    nextStageCost,
    progressMs: state.founderTakePreparation.progressMs,
    remainingMs,
    outputRetention: activeStage?.outputRetention ?? 1,
    canStartNextStage: canStartFounderTakePreparation(state),
  };
}

export function founderTakeStageCost(
  state: GriftOsGameState,
  stage?: FounderTakeStageTuning | null
): number {
  const targetStage = stage ?? nextFounderTakeStage(state);

  if (!targetStage) {
    return 0;
  }

  return rugPullTargetForNetWorth(state.netWorth) * targetStage.costTargetRatio;
}

export function nextFounderTakeStage(state: GriftOsGameState): FounderTakeStageTuning | null {
  return GRIFT_OS_FOUNDER_TAKE_TUNING.stages[safeCompletedStages(state)] ?? null;
}

export function canStartFounderTakePreparation(state: GriftOsGameState): boolean {
  const stage = nextFounderTakeStage(state);

  return stage !== null &&
    !state.founderTakePreparation.isActive &&
    state.peakValuation >= rugPullTargetForNetWorth(state.netWorth) &&
    state.valuation >= founderTakeStageCost(state, stage);
}

export function startFounderTakePreparation(state: GriftOsGameState): FounderTakePreparationResult {
  const stage = nextFounderTakeStage(state);

  if (!stage || !canStartFounderTakePreparation(state)) {
    return { state, started: false, totalCost: 0 };
  }

  const totalCost = founderTakeStageCost(state, stage);

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

export function founderTakePreparationRemainingMs(state: GriftOsGameState): number | null {
  if (!state.founderTakePreparation.isActive) {
    return null;
  }

  const stage = nextFounderTakeStage(state);

  return stage
    ? Math.max(0, stage.durationMs - state.founderTakePreparation.progressMs)
    : 0;
}

export function advanceFounderTakePreparation(
  state: GriftOsGameState,
  elapsedMs: number
): GriftOsGameState {
  if (!state.founderTakePreparation.isActive) {
    return state;
  }

  const stage = nextFounderTakeStage(state);

  if (!stage) {
    return {
      ...state,
      founderTakePreparation: {
        completedStages: GRIFT_OS_FOUNDER_TAKE_TUNING.stages.length,
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
        GRIFT_OS_FOUNDER_TAKE_TUNING.stages.length,
        safeCompletedStages(state) + 1
      ),
      isActive: false,
      progressMs: 0,
    },
  };
}

export function founderTakeOutputRetention(state: GriftOsGameState): number {
  return founderTakeStatus(state).outputRetention;
}

function safeCompletedStages(state: GriftOsGameState): number {
  return Math.min(
    GRIFT_OS_FOUNDER_TAKE_TUNING.stages.length,
    Math.max(0, Math.floor(state.founderTakePreparation.completedStages))
  );
}
