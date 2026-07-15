import { createInitialGameState } from './economy';
import { extractionRate } from './extraction';
import { GameMechanics, GameUnlock } from './mechanics';
import { wealthAdvantageMultiplier } from './modifiers';
import {
  campaignStratumForNetWorth,
  newlyUnlockedMechanics,
  rugPullTargetForNetWorth,
} from './progression';
import { GriftOsGameState, RugPullState } from './types';

export interface RugPullMechanicsPreview {
  state: RugPullState;
  currentValuation: number;
  peakValuation: number;
  projectedNetWorthGain: number;
  resultingNetWorth: number;
  wealthAdvantagePercent: number;
  requiredPeakValuation: number;
  valuationRemaining: number;
  recoveryMultiplier: number;
  newlyUnlocked: readonly GameUnlock[];
  campaignStratumId: string;
  extractionRate: number;
  isAvailable: boolean;
}

export interface RugPullCommitResult {
  state: GriftOsGameState;
  netWorthGained: number;
}

export function rugPullStateForValuation(
  state: GriftOsGameState,
  mechanics: GameMechanics
): RugPullState {
  if (state.rugPullState === 'preview' || state.rugPullState === 'committed' || state.rugPullState === 'extracting') {
    return state.rugPullState;
  }

  return state.peakValuation >= rugPullTargetForNetWorth(state.peakNetWorth, mechanics)
    ? 'available'
    : 'unavailable';
}

export function projectedNetWorthGain(
  peakValuation: number,
  peakNetWorth: number,
  takeRate: number,
  mechanics: GameMechanics
): number {
  const stratum = campaignStratumForNetWorth(peakNetWorth, mechanics);

  if (!Number.isFinite(peakValuation) || peakValuation < stratum.rugPullTarget) {
    return 0;
  }

  return Math.floor(
    stratum.rugPullTarget * Math.max(0, takeRate) * stratum.rewardShaping *
    (peakValuation / stratum.rugPullTarget) ** mechanics.prestige.netWorthGainExponent
  );
}

export function createRugPullPreview(
  state: GriftOsGameState,
  mechanics: GameMechanics
): RugPullMechanicsPreview {
  const requiredPeakValuation = rugPullTargetForNetWorth(state.peakNetWorth, mechanics);
  const takeRate = extractionRate(state, mechanics);
  const projectedGain = projectedNetWorthGain(
    state.peakValuation,
    state.peakNetWorth,
    takeRate,
    mechanics
  );
  const resultingNetWorth = state.netWorth + projectedGain;
  const resultingMultiplier = wealthAdvantageMultiplier(resultingNetWorth, mechanics);
  const currentMultiplier = wealthAdvantageMultiplier(state.netWorth, mechanics);
  const resultingPeakNetWorth = Math.max(state.peakNetWorth, resultingNetWorth);
  const stratum = campaignStratumForNetWorth(state.peakNetWorth, mechanics);

  return {
    state: rugPullStateForValuation(state, mechanics),
    currentValuation: state.valuation,
    peakValuation: state.peakValuation,
    projectedNetWorthGain: projectedGain,
    resultingNetWorth,
    wealthAdvantagePercent: (resultingMultiplier - 1) * 100,
    requiredPeakValuation,
    valuationRemaining: Math.max(0, requiredPeakValuation - state.peakValuation),
    recoveryMultiplier: resultingMultiplier / Math.max(1, currentMultiplier),
    newlyUnlocked: newlyUnlockedMechanics(state.peakNetWorth, resultingPeakNetWorth, mechanics),
    campaignStratumId: stratum.id,
    extractionRate: takeRate,
    isAvailable: projectedGain > 0,
  };
}

export function commitRugPull(
  state: GriftOsGameState,
  mechanics: GameMechanics
): RugPullCommitResult {
  const netWorthGained = projectedNetWorthGain(
    state.peakValuation,
    state.peakNetWorth,
    extractionRate(state, mechanics),
    mechanics
  );

  if (netWorthGained <= 0) {
    return {
      state: {
        ...state,
        rugPullState: 'unavailable',
      },
      netWorthGained: 0,
    };
  }

  return {
    state: createInitialGameState(
      mechanics,
      state.netWorth + netWorthGained,
      state.rugPullCount + 1,
      Math.max(state.peakNetWorth, state.netWorth + netWorthGained)
    ),
    netWorthGained,
  };
}
