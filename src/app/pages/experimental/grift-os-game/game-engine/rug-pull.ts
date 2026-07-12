import { createInitialGameState } from './economy';
import { founderTakeRate } from './founder-take';
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
  founderTakeRate: number;
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

  return state.peakValuation >= rugPullTargetForNetWorth(state.netWorth, mechanics)
    ? 'available'
    : 'unavailable';
}

export function projectedNetWorthGain(
  peakValuation: number,
  currentNetWorth: number,
  takeRate: number,
  mechanics: GameMechanics
): number {
  const stratum = campaignStratumForNetWorth(currentNetWorth, mechanics);

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
  const requiredPeakValuation = rugPullTargetForNetWorth(state.netWorth, mechanics);
  const takeRate = founderTakeRate(state, mechanics);
  const projectedGain = projectedNetWorthGain(
    state.peakValuation,
    state.netWorth,
    takeRate,
    mechanics
  );
  const resultingNetWorth = state.netWorth + projectedGain;
  const resultingMultiplier = wealthAdvantageMultiplier(resultingNetWorth, mechanics);
  const currentMultiplier = wealthAdvantageMultiplier(state.netWorth, mechanics);
  const stratum = campaignStratumForNetWorth(state.netWorth, mechanics);

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
    newlyUnlocked: newlyUnlockedMechanics(state.netWorth, resultingNetWorth, mechanics),
    campaignStratumId: stratum.id,
    founderTakeRate: takeRate,
    isAvailable: projectedGain > 0,
  };
}

export function commitRugPull(
  state: GriftOsGameState,
  mechanics: GameMechanics
): RugPullCommitResult {
  const netWorthGained = projectedNetWorthGain(
    state.peakValuation,
    state.netWorth,
    founderTakeRate(state, mechanics),
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
      state.rugPullCount + 1
    ),
    netWorthGained,
  };
}
