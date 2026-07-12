import {
  HustleId,
  LeverageDomain,
  LeverageId,
  ModifierKind,
  ModifierScope,
} from '../../../game-engine/types';
import { GameMechanics } from '../../../game-engine/mechanics';

export type InfluenceCampaignStratumId =
  | 'attention'
  | 'doctrine'
  | 'capital'
  | 'institutional'
  | 'sovereignty'
  | 'postgame';

export type InfluenceFounderTakeStageId = 'retained-rights' | 'locked-cap-table';

export interface InfluenceHustleEconomyTuning {
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  automationCost: number;
  initialUnits: number;
  unlockNetWorth: number;
}

export interface InfluenceMilestoneMechanics {
  id: string;
  requiredUnits: number;
  kind: Exclude<ModifierKind, 'starting-value'>;
  value: number;
}

export interface InfluenceCampaignStratumMechanics {
  id: InfluenceCampaignStratumId;
  minimumNetWorth: number;
  rugPullTarget: number;
  rewardShaping: number;
}

export interface InfluenceFounderTakeStageMechanics {
  id: InfluenceFounderTakeStageId;
  takeBonus: number;
  costTargetRatio: number;
  durationMs: number;
  outputRetention: number;
}

export interface InfluenceLeverageModifierMechanics {
  id: string;
  scope: Extract<ModifierScope, 'global' | 'synergy'>;
  kind: ModifierKind;
  value: number;
  hustleIds?: readonly HustleId[];
}

export interface InfluenceLeverageMechanics {
  id: LeverageId;
  domain: LeverageDomain;
  cost: number;
  unlockNetWorth: number;
  requiredOwnedHustles: readonly HustleId[];
  requiredAutomatedHustles: readonly HustleId[];
  modifiers: readonly InfluenceLeverageModifierMechanics[];
}

const hustleOrder: readonly HustleId[] = [
  'troll-network',
  'podcast-network',
  'culture-war-media',
  'masterclass-business',
  'manifesto-imprint',
  'founder-retreat-circuit',
  'ai-venture',
  'venture-portfolio',
  'media-holdings',
  'sovereign-network',
];

const hustles: Readonly<Record<HustleId, InfluenceHustleEconomyTuning>> = {
  'troll-network': { acquisitionCost: 0.025, growthRate: 1.18, basePayout: 0.0025, cadenceSeconds: 2, automationCost: 0.5, initialUnits: 1, unlockNetWorth: 0 },
  'podcast-network': { acquisitionCost: 2, growthRate: 1.2, basePayout: 0.2, cadenceSeconds: 5, automationCost: 12, initialUnits: 0, unlockNetWorth: 0 },
  'culture-war-media': { acquisitionCost: 50, growthRate: 1.22, basePayout: 8, cadenceSeconds: 10, automationCost: 300, initialUnits: 0, unlockNetWorth: 0 },
  'masterclass-business': { acquisitionCost: 1_500, growthRate: 1.24, basePayout: 250, cadenceSeconds: 20, automationCost: 9_000, initialUnits: 0, unlockNetWorth: 0 },
  'manifesto-imprint': { acquisitionCost: 50_000, growthRate: 1.26, basePayout: 8_000, cadenceSeconds: 30, automationCost: 300_000, initialUnits: 0, unlockNetWorth: 0 },
  'founder-retreat-circuit': { acquisitionCost: 2_000_000, growthRate: 1.28, basePayout: 120_000, cadenceSeconds: 45, automationCost: 12_000_000, initialUnits: 0, unlockNetWorth: 1_000_000 },
  'ai-venture': { acquisitionCost: 75_000_000, growthRate: 1.3, basePayout: 600_000, cadenceSeconds: 60, automationCost: 450_000_000, initialUnits: 0, unlockNetWorth: 30_000_000 },
  'venture-portfolio': { acquisitionCost: 3_000_000_000, growthRate: 1.32, basePayout: 30_000_000, cadenceSeconds: 90, automationCost: 18_000_000_000, initialUnits: 0, unlockNetWorth: 1_000_000_000 },
  'media-holdings': { acquisitionCost: 100_000_000_000, growthRate: 1.34, basePayout: 200_000_000, cadenceSeconds: 120, automationCost: 500_000_000_000, initialUnits: 0, unlockNetWorth: 30_000_000_000 },
  'sovereign-network': { acquisitionCost: 2_000_000_000_000, growthRate: 1.36, basePayout: 2_000_000_000, cadenceSeconds: 180, automationCost: 6_000_000_000_000, initialUnits: 0, unlockNetWorth: 30_000_000_000 },
};

const milestones: Readonly<Record<HustleId, readonly InfluenceMilestoneMechanics[]>> = {
  'troll-network': [milestone('troll-network', 10, 'output', 2), milestone('troll-network', 25, 'cadence', 1), milestone('troll-network', 50, 'output', 7), milestone('troll-network', 100, 'cost', 1)],
  'podcast-network': [milestone('podcast-network', 5, 'output', 1.5), milestone('podcast-network', 15, 'automation-cost', 1), milestone('podcast-network', 30, 'cadence', 1), milestone('podcast-network', 75, 'output', 8.5)],
  'culture-war-media': [milestone('culture-war-media', 5, 'output', 2), milestone('culture-war-media', 20, 'cadence', 0.75), milestone('culture-war-media', 40, 'output', 8), milestone('culture-war-media', 100, 'cost', 1.5)],
  'masterclass-business': [milestone('masterclass-business', 5, 'automation-cost', 1), milestone('masterclass-business', 15, 'output', 3), milestone('masterclass-business', 35, 'cadence', 1), milestone('masterclass-business', 75, 'output', 12)],
  'manifesto-imprint': [milestone('manifesto-imprint', 5, 'output', 3), milestone('manifesto-imprint', 15, 'cadence', 1), milestone('manifesto-imprint', 30, 'cost', 1), milestone('manifesto-imprint', 60, 'output', 15)],
  'founder-retreat-circuit': [milestone('founder-retreat-circuit', 3, 'output', 4), milestone('founder-retreat-circuit', 10, 'automation-cost', 1), milestone('founder-retreat-circuit', 25, 'cadence', 1.5), milestone('founder-retreat-circuit', 50, 'output', 10)],
  'ai-venture': [milestone('ai-venture', 3, 'output', 5), milestone('ai-venture', 10, 'cadence', 1), milestone('ai-venture', 25, 'cost', 1.5), milestone('ai-venture', 50, 'output', 15)],
  'venture-portfolio': [milestone('venture-portfolio', 2, 'output', 7), milestone('venture-portfolio', 8, 'automation-cost', 1.5), milestone('venture-portfolio', 20, 'cadence', 1.5), milestone('venture-portfolio', 40, 'output', 10)],
  'media-holdings': [milestone('media-holdings', 2, 'output', 9), milestone('media-holdings', 6, 'cost', 1.5), milestone('media-holdings', 15, 'cadence', 2), milestone('media-holdings', 30, 'output', 10)],
  'sovereign-network': [milestone('sovereign-network', 2, 'output', 4), milestone('sovereign-network', 5, 'automation-cost', 2), milestone('sovereign-network', 12, 'cadence', 1), milestone('sovereign-network', 25, 'output', 10)],
};

const campaignStrata: readonly InfluenceCampaignStratumMechanics[] = [
  { id: 'attention', minimumNetWorth: 0, rugPullTarget: 100_000_000, rewardShaping: 0.1 },
  { id: 'doctrine', minimumNetWorth: 1_000_000, rugPullTarget: 3_000_000_000, rewardShaping: 0.1 },
  { id: 'capital', minimumNetWorth: 30_000_000, rugPullTarget: 100_000_000_000, rewardShaping: 0.1 },
  { id: 'institutional', minimumNetWorth: 1_000_000_000, rugPullTarget: 3_000_000_000_000, rewardShaping: 0.1 },
  { id: 'sovereignty', minimumNetWorth: 30_000_000_000, rugPullTarget: 100_000_000_000_000, rewardShaping: 0.1 },
  { id: 'postgame', minimumNetWorth: 1_000_000_000_000, rugPullTarget: 1_000_000_000_000_000, rewardShaping: 0.1 },
];

const founderTake = {
  baseTake: 0.1,
  stages: [
    { id: 'retained-rights', takeBonus: 0.05, costTargetRatio: 0.03, durationMs: 2 * 60 * 60 * 1000, outputRetention: 0.75 },
    { id: 'locked-cap-table', takeBonus: 0.05, costTargetRatio: 0.07, durationMs: 6 * 60 * 60 * 1000, outputRetention: 0.6 },
  ] as const satisfies readonly InfluenceFounderTakeStageMechanics[],
} as const;

const leverage: readonly InfluenceLeverageMechanics[] = [
  {
    id: 'attention-loop', domain: 'attention', cost: 25_000_000, unlockNetWorth: 0,
    requiredOwnedHustles: ['masterclass-business'],
    requiredAutomatedHustles: ['troll-network', 'podcast-network', 'culture-war-media'],
    modifiers: [leverageModifier('attention-loop-output', 'output', 1, ['troll-network', 'podcast-network', 'culture-war-media', 'masterclass-business', 'manifesto-imprint'])],
  },
  {
    id: 'closed-circuit-doctrine', domain: 'doctrine', cost: 750_000_000, unlockNetWorth: 1_000_000,
    requiredOwnedHustles: ['founder-retreat-circuit'],
    requiredAutomatedHustles: ['podcast-network', 'manifesto-imprint', 'founder-retreat-circuit'],
    modifiers: [
      leverageModifier('closed-circuit-doctrine-output', 'output', 1, ['podcast-network', 'culture-war-media', 'masterclass-business', 'manifesto-imprint', 'founder-retreat-circuit']),
      leverageModifier('closed-circuit-doctrine-cost', 'cost', 0.5),
    ],
  },
  {
    id: 'capital-access', domain: 'capital', cost: 25_000_000_000, unlockNetWorth: 30_000_000,
    requiredOwnedHustles: ['venture-portfolio'],
    requiredAutomatedHustles: ['founder-retreat-circuit', 'ai-venture'],
    modifiers: [
      leverageModifier('capital-access-output', 'output', 1, ['founder-retreat-circuit', 'ai-venture', 'venture-portfolio']),
      leverageModifier('capital-access-automation', 'automation-cost', 1),
    ],
  },
  {
    id: 'institutional-capture', domain: 'capital', cost: 750_000_000_000, unlockNetWorth: 1_000_000_000,
    requiredOwnedHustles: ['venture-portfolio'],
    requiredAutomatedHustles: ['ai-venture', 'venture-portfolio'],
    modifiers: [
      leverageModifier('institutional-capture-output', 'output', 1, ['masterclass-business', 'venture-portfolio', 'media-holdings', 'sovereign-network']),
      leverageModifier('institutional-capture-speed', 'cadence', 0.5, ['masterclass-business', 'media-holdings', 'sovereign-network']),
    ],
  },
  {
    id: 'sovereign-stack', domain: 'sovereignty', cost: 25_000_000_000_000, unlockNetWorth: 30_000_000_000,
    requiredOwnedHustles: ['sovereign-network'],
    requiredAutomatedHustles: ['media-holdings'],
    modifiers: [
      leverageModifier('sovereign-stack-output', 'output', 2, ['media-holdings', 'sovereign-network']),
      leverageModifier('sovereign-stack-cost', 'cost', 0.5),
    ],
  },
];

export const INFLUENCE_MECHANICS_PACK = {
  id: 'influence',
  hustleOrder,
  hustles,
  milestones,
  campaignStrata,
  prestige: {
    unlockValuation: campaignStrata[0].rugPullTarget,
    netWorthGainExponent: 0.75,
    wealthAdvantageBase: 1_000_000,
    wealthAdvantageCoefficient: 4,
    wealthAdvantageExponent: 0.3,
    frontierWealthFactor: 0.05,
    priorStratumWealthFactor: 0.25,
    campaignTargetNetWorth: 1_000_000_000_000,
    curatedValuationEnvelope: 1_000_000_000_000_000,
  },
  founderTake,
  leverage,
} as const;

export const INFLUENCE_ENGINE_MECHANICS: GameMechanics = Object.assign(
  hustleOrder.map((hustleId) => ({
    id: hustleId,
    ...hustles[hustleId],
    milestones: milestones[hustleId].map((entry) => ({
      id: entry.id,
      requiredUnits: entry.requiredUnits,
      reward: {
        id: `${hustleId}-units-${entry.requiredUnits}-${entry.kind}`,
        scope: 'hustle' as const,
        kind: entry.kind,
        value: entry.value,
        hustleId,
        source: 'milestone' as const,
      },
    })),
  })),
  {
    leverage: leverage.map((definition) => ({
      ...definition,
      modifiers: definition.modifiers.map((modifier) => ({
        ...modifier,
        source: 'leverage' as const,
      })),
    })),
    campaignStrata,
    prestige: INFLUENCE_MECHANICS_PACK.prestige,
    founderTake,
  }
);

function milestone(
  hustleId: HustleId,
  requiredUnits: number,
  kind: InfluenceMilestoneMechanics['kind'],
  value: number
): InfluenceMilestoneMechanics {
  return { id: `${hustleId}-${requiredUnits}`, requiredUnits, kind, value };
}

function leverageModifier(
  id: string,
  kind: ModifierKind,
  value: number,
  hustleIds?: readonly HustleId[]
): InfluenceLeverageModifierMechanics {
  return { id, scope: hustleIds ? 'synergy' : 'global', kind, value, hustleIds };
}
