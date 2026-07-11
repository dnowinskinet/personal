import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import {
  GRIFT_OS_FOUNDER_TAKE_TUNING,
  GRIFT_OS_PRESTIGE_TUNING,
} from '../content/economy-tuning';
import { createInitialGameState } from './economy';
import { founderTakeRate } from './founder-take';
import {
  campaignStratumForNetWorth,
  newlyUnlockedLabels,
  rugPullTargetForNetWorth,
} from './progression';
import { wealthAdvantageMultiplier } from './modifiers';
import { GriftOsGameState, HustleDefinition, RugPullState } from './types';

export const RUG_PULL_CONFIG = GRIFT_OS_PRESTIGE_TUNING;

export interface RugPullPreview {
  state: RugPullState;
  currentValuation: number;
  peakValuation: number;
  projectedNetWorthGain: number;
  resultingNetWorth: number;
  wealthAdvantagePercent: number;
  requiredPeakValuation: number;
  valuationRemaining: number;
  recoveryMultiplier: number;
  newlyUnlocked: readonly string[];
  campaignStratumLabel: string;
  founderTakeRate: number;
  isAvailable: boolean;
}

export interface RugPullCommitResult {
  state: GriftOsGameState;
  netWorthGained: number;
}

export function rugPullStateForValuation(state: GriftOsGameState): RugPullState {
  if (state.rugPullState === 'preview' || state.rugPullState === 'committed' || state.rugPullState === 'extracting') {
    return state.rugPullState;
  }

  return state.peakValuation >= rugPullTargetForNetWorth(state.netWorth) ? 'available' : 'unavailable';
}

export function projectedNetWorthGain(
  peakValuation: number,
  currentNetWorth = 0,
  takeRate: number = GRIFT_OS_FOUNDER_TAKE_TUNING.baseTake
): number {
  const stratum = campaignStratumForNetWorth(currentNetWorth);

  if (!Number.isFinite(peakValuation) || peakValuation < stratum.rugPullTarget) {
    return 0;
  }

  return Math.floor(
    stratum.rugPullTarget * Math.max(0, takeRate) * stratum.rewardShaping *
    (peakValuation / stratum.rugPullTarget) ** RUG_PULL_CONFIG.netWorthGainExponent
  );
}

export function createRugPullPreview(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[] = HUSTLE_DEFINITIONS
): RugPullPreview {
  const requiredPeakValuation = rugPullTargetForNetWorth(state.netWorth);
  const takeRate = founderTakeRate(state);
  const projectedGain = projectedNetWorthGain(state.peakValuation, state.netWorth, takeRate);
  const resultingNetWorth = state.netWorth + projectedGain;
  const resultingMultiplier = wealthAdvantageMultiplier(resultingNetWorth);
  const currentMultiplier = wealthAdvantageMultiplier(state.netWorth);

  return {
    state: rugPullStateForValuation(state),
    currentValuation: state.valuation,
    peakValuation: state.peakValuation,
    projectedNetWorthGain: projectedGain,
    resultingNetWorth,
    wealthAdvantagePercent: (resultingMultiplier - 1) * 100,
    requiredPeakValuation,
    valuationRemaining: Math.max(0, requiredPeakValuation - state.peakValuation),
    recoveryMultiplier: resultingMultiplier / Math.max(1, currentMultiplier),
    newlyUnlocked: newlyUnlockedLabels(state.netWorth, resultingNetWorth, definitions),
    campaignStratumLabel: campaignStratumForNetWorth(state.netWorth).label,
    founderTakeRate: takeRate,
    isAvailable: projectedGain > 0,
  };
}

export function commitRugPull(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[] = HUSTLE_DEFINITIONS
): RugPullCommitResult {
  const netWorthGained = projectedNetWorthGain(
    state.peakValuation,
    state.netWorth,
    founderTakeRate(state)
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
      definitions,
      state.netWorth + netWorthGained,
      state.rugPullCount + 1
    ),
    netWorthGained,
  };
}
