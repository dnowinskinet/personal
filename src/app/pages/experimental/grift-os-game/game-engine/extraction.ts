import { ExtractionStageMechanics, GameMechanics } from './mechanics';
import { rugPullTargetForNetWorth } from './progression';
import {
  ExtractionPreparationResult,
  GriftOsGameState,
} from './types';

export interface ExtractionStatus {
  takeRate: number;
  completedStages: number;
  isPreparing: boolean;
  activeStage: ExtractionStageMechanics | null;
  nextStage: ExtractionStageMechanics | null;
  nextStageCost: number;
  progressMs: number;
  remainingMs: number;
  outputRetention: number;
  canStartNextStage: boolean;
}

export function extractionRate(state: GriftOsGameState, mechanics: GameMechanics): number {
  const completedStages = safeCompletedStages(state, mechanics);
  const completedBonus = mechanics.extraction.stages
    .slice(0, completedStages)
    .reduce((total, stage) => total + stage.takeBonus, 0);

  return mechanics.extraction.baseTake + completedBonus;
}

export function extractionStatus(
  state: GriftOsGameState,
  mechanics: GameMechanics
): ExtractionStatus {
  const completedStages = safeCompletedStages(state, mechanics);
  const activeStage = state.extractionPreparation.isActive
    ? mechanics.extraction.stages[completedStages] ?? null
    : null;
  const nextStage = mechanics.extraction.stages[completedStages] ?? null;
  const nextStageCost = nextStage ? extractionStageCost(state, mechanics, nextStage) : 0;
  const remainingMs = activeStage
    ? Math.max(0, activeStage.durationMs - state.extractionPreparation.progressMs)
    : 0;

  return {
    takeRate: extractionRate(state, mechanics),
    completedStages,
    isPreparing: activeStage !== null,
    activeStage,
    nextStage,
    nextStageCost,
    progressMs: state.extractionPreparation.progressMs,
    remainingMs,
    outputRetention: activeStage?.outputRetention ?? 1,
    canStartNextStage: canStartExtractionPreparation(state, mechanics),
  };
}

export function extractionStageCost(
  state: GriftOsGameState,
  mechanics: GameMechanics,
  stage?: ExtractionStageMechanics | null
): number {
  const targetStage = stage ?? nextExtractionStage(state, mechanics);

  if (!targetStage) {
    return 0;
  }

  return rugPullTargetForNetWorth(state.peakNetWorth, mechanics) * targetStage.costTargetRatio;
}

export function nextExtractionStage(
  state: GriftOsGameState,
  mechanics: GameMechanics
): ExtractionStageMechanics | null {
  return mechanics.extraction.stages[safeCompletedStages(state, mechanics)] ?? null;
}

export function canStartExtractionPreparation(
  state: GriftOsGameState,
  mechanics: GameMechanics
): boolean {
  const stage = nextExtractionStage(state, mechanics);

  return stage !== null &&
    !state.extractionPreparation.isActive &&
    state.peakValuation >= rugPullTargetForNetWorth(state.peakNetWorth, mechanics) &&
    state.valuation >= extractionStageCost(state, mechanics, stage);
}

export function startExtractionPreparation(
  state: GriftOsGameState,
  mechanics: GameMechanics
): ExtractionPreparationResult {
  const stage = nextExtractionStage(state, mechanics);

  if (!stage || !canStartExtractionPreparation(state, mechanics)) {
    return { state, started: false, totalCost: 0 };
  }

  const totalCost = extractionStageCost(state, mechanics, stage);

  return {
    state: {
      ...state,
      valuation: Math.max(0, state.valuation - totalCost),
      extractionPreparation: {
        ...state.extractionPreparation,
        isActive: true,
        progressMs: 0,
      },
    },
    started: true,
    totalCost,
  };
}

export function extractionPreparationRemainingMs(
  state: GriftOsGameState,
  mechanics: GameMechanics
): number | null {
  if (!state.extractionPreparation.isActive) {
    return null;
  }

  const stage = nextExtractionStage(state, mechanics);

  return stage
    ? Math.max(0, stage.durationMs - state.extractionPreparation.progressMs)
    : 0;
}

export function advanceExtractionPreparation(
  state: GriftOsGameState,
  elapsedMs: number,
  mechanics: GameMechanics
): GriftOsGameState {
  if (!state.extractionPreparation.isActive) {
    return state;
  }

  const stage = nextExtractionStage(state, mechanics);

  if (!stage) {
    return {
      ...state,
      extractionPreparation: {
        completedStages: mechanics.extraction.stages.length,
        isActive: false,
        progressMs: 0,
      },
    };
  }

  const progressMs = state.extractionPreparation.progressMs + Math.max(0, elapsedMs);

  if (progressMs < stage.durationMs) {
    return {
      ...state,
      extractionPreparation: {
        ...state.extractionPreparation,
        progressMs,
      },
    };
  }

  return {
    ...state,
    extractionPreparation: {
      completedStages: Math.min(
        mechanics.extraction.stages.length,
        safeCompletedStages(state, mechanics) + 1
      ),
      isActive: false,
      progressMs: 0,
    },
  };
}

export function extractionOutputRetention(
  state: GriftOsGameState,
  mechanics: GameMechanics
): number {
  return extractionStatus(state, mechanics).outputRetention;
}

function safeCompletedStages(state: GriftOsGameState, mechanics: GameMechanics): number {
  return Math.min(
    mechanics.extraction.stages.length,
    Math.max(0, Math.floor(state.extractionPreparation.completedStages))
  );
}
