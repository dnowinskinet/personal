import { HUSTLE_DEFINITIONS } from '../content/hustle-definitions';
import { createInitialGameState } from './economy';
import { GriftOsGameState, HustleDefinition, RugPullState } from './types';

export const RUG_PULL_CONFIG = {
  unlockValuation: 50_000_000,
  baseNetWorthGain: 100_000,
  wealthAdvantageBase: 100_000,
};

export interface RugPullPreview {
  state: RugPullState;
  currentValuation: number;
  peakValuation: number;
  projectedNetWorthGain: number;
  resultingNetWorth: number;
  wealthAdvantagePercent: number;
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

  return state.peakValuation >= RUG_PULL_CONFIG.unlockValuation ? 'available' : 'unavailable';
}

export function projectedNetWorthGain(peakValuation: number): number {
  if (!Number.isFinite(peakValuation) || peakValuation < RUG_PULL_CONFIG.unlockValuation) {
    return 0;
  }

  return Math.floor(
    RUG_PULL_CONFIG.baseNetWorthGain *
    Math.sqrt(peakValuation / RUG_PULL_CONFIG.unlockValuation)
  );
}

export function createRugPullPreview(state: GriftOsGameState): RugPullPreview {
  const projectedGain = projectedNetWorthGain(state.peakValuation);
  const resultingNetWorth = state.netWorth + projectedGain;
  const wealthAdvantagePercent = 20 * Math.log10(
    1 + Math.max(0, resultingNetWorth) / RUG_PULL_CONFIG.wealthAdvantageBase
  );

  return {
    state: rugPullStateForValuation(state),
    currentValuation: state.valuation,
    peakValuation: state.peakValuation,
    projectedNetWorthGain: projectedGain,
    resultingNetWorth,
    wealthAdvantagePercent,
    isAvailable: projectedGain > 0,
  };
}

export function commitRugPull(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[] = HUSTLE_DEFINITIONS
): RugPullCommitResult {
  const netWorthGained = projectedNetWorthGain(state.peakValuation);

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
    state: createInitialGameState(definitions, state.netWorth + netWorthGained),
    netWorthGained,
  };
}
