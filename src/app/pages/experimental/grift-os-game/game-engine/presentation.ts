import { valuationPerSecond } from './economy';
import { GameMechanics } from './mechanics';
import { rugPullTargetForNetWorth } from './progression';
import { GriftOsGameState } from './types';

export type EnterpriseStage =
  | 'scrappy'
  | 'traction'
  | 'legitimate'
  | 'institutional'
  | 'power'
  | 'pre-rug';

export interface EnterprisePresentation {
  enterpriseIntensity: number;
  enterpriseStage: EnterpriseStage;
  activeRatio: number;
  automationRatio: number;
  valuationProgress: number;
  leverageProgress: number;
  metaProgress: number;
  valuationPerSecond: number;
}

export const ENTERPRISE_INTENSITY_CONFIG = {
  valuationWeight: 0.45,
  activeHustleWeight: 0.2,
  automationWeight: 0.2,
  leverageWeight: 0.1,
  metaWeight: 0.05,
  netWorthSoftCap: 1_000_000,
};

export function deriveEnterprisePresentation(
  state: GriftOsGameState,
  definitions: GameMechanics
): EnterprisePresentation {
  const activeCount = definitions.filter((definition) => {
    const hustle = state.hustles[definition.id];

    return hustle.scaleCount > 0 || hustle.isActive || hustle.isAutomated;
  }).length;
  const automatedCount = definitions.filter((definition) =>
    state.hustles[definition.id].isAutomated
  ).length;
  const valuationProgress = logarithmicProgress(
    state.peakValuation,
    rugPullTargetForNetWorth(state.peakNetWorth, definitions)
  );
  const activeRatio = activeCount / definitions.length;
  const automationRatio = automatedCount / definitions.length;
  const leverageProgress = definitions.leverage.length > 0
    ? state.leveragePurchases.length / definitions.leverage.length
    : 0;
  const metaProgress = logarithmicProgress(
    state.netWorth,
    ENTERPRISE_INTENSITY_CONFIG.netWorthSoftCap
  );
  const enterpriseIntensity = clamp01(
    valuationProgress * ENTERPRISE_INTENSITY_CONFIG.valuationWeight +
    activeRatio * ENTERPRISE_INTENSITY_CONFIG.activeHustleWeight +
    automationRatio * ENTERPRISE_INTENSITY_CONFIG.automationWeight +
    leverageProgress * ENTERPRISE_INTENSITY_CONFIG.leverageWeight +
    metaProgress * ENTERPRISE_INTENSITY_CONFIG.metaWeight
  );

  return {
    enterpriseIntensity,
    enterpriseStage: stageForIntensity(
      enterpriseIntensity,
      state.peakValuation,
      rugPullTargetForNetWorth(state.peakNetWorth, definitions)
    ),
    activeRatio,
    automationRatio,
    valuationProgress,
    leverageProgress,
    metaProgress,
    valuationPerSecond: valuationPerSecond(state, definitions),
  };
}

export function stageForIntensity(
  enterpriseIntensity: number,
  peakValuation = 0,
  rugPullTarget = Number.POSITIVE_INFINITY
): EnterpriseStage {
  if (peakValuation >= rugPullTarget) {
    return 'pre-rug';
  }

  if (enterpriseIntensity >= 0.8) {
    return 'power';
  }

  if (enterpriseIntensity >= 0.62) {
    return 'institutional';
  }

  if (enterpriseIntensity >= 0.42) {
    return 'legitimate';
  }

  if (enterpriseIntensity >= 0.2) {
    return 'traction';
  }

  return 'scrappy';
}

function logarithmicProgress(value: number, softCap: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return clamp01(Math.log10(1 + value) / Math.log10(1 + softCap));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
