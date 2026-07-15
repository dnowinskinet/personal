import {
  HustleId,
  LeverageDomain,
  LeverageId,
  ModifierKind,
  ModifierScope,
} from './types';

export interface MechanicalModifierDefinition {
  id: string;
  scope: ModifierScope;
  kind: ModifierKind;
  value: number;
  hustleId?: HustleId;
  hustleIds?: readonly HustleId[];
  source: 'milestone' | 'leverage' | 'rug-pull' | 'system';
}

export interface HustleMilestoneMechanics {
  id: string;
  requiredScaleCount: number;
  reward: MechanicalModifierDefinition;
}

export interface HustleMechanicsDefinition {
  id: HustleId;
  automationCost: number;
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  initialScaleCount: number;
  unlockNetWorth: number;
  milestones: readonly HustleMilestoneMechanics[];
}

export interface LeverageMechanicsDefinition {
  id: LeverageId;
  domain: LeverageDomain;
  cost: number;
  unlockNetWorth: number;
  requiredOwnedHustles: readonly HustleId[];
  requiredAutomatedHustles: readonly HustleId[];
  modifiers: readonly MechanicalModifierDefinition[];
}

export interface CampaignStratumMechanics {
  id: string;
  minimumNetWorth: number;
  rugPullTarget: number;
  rewardShaping: number;
}

export interface PrestigeMechanics {
  unlockValuation: number;
  netWorthGainExponent: number;
  wealthAdvantageBase: number;
  wealthAdvantageCoefficient: number;
  wealthAdvantageExponent: number;
  frontierWealthFactor: number;
  priorStratumWealthFactor: number;
  campaignTargetNetWorth: number;
  curatedValuationEnvelope: number;
}

export interface ExtractionStageMechanics {
  id: string;
  takeBonus: number;
  costTargetRatio: number;
  durationMs: number;
  outputRetention: number;
}

export interface ExtractionMechanics {
  baseTake: number;
  stages: readonly ExtractionStageMechanics[];
}

export interface GameMechanics extends ReadonlyArray<HustleMechanicsDefinition> {
  readonly leverage: readonly LeverageMechanicsDefinition[];
  readonly campaignStrata: readonly CampaignStratumMechanics[];
  readonly prestige: PrestigeMechanics;
  readonly extraction: ExtractionMechanics;
}

export type GameUnlock =
  | { kind: 'leverage'; id: LeverageId }
  | { kind: 'campaign-stratum'; id: string };
