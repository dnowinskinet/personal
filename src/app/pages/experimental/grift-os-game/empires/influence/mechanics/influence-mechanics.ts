import {
  HustleId,
  LeverageDomain,
  LeverageId,
  ModifierKind,
  ModifierScope,
} from '../../../game-engine/types';
import { GameMechanics } from '../../../game-engine/mechanics';
import {
  HUSTLE_ECONOMIC_SLOTS,
  HustleEconomicMilestone,
  HustleEconomicSlotId,
  HustleEconomicTuning,
  validateEconomicSlotMapping,
} from '../../../economic-slots/economic-slot-catalog';

export type InfluenceCampaignStratumId =
  | 'attention'
  | 'doctrine'
  | 'capital'
  | 'institutional'
  | 'sovereignty'
  | 'postgame';

export type InfluenceFounderTakeStageId = 'retained-rights' | 'locked-cap-table';

export type InfluenceHustleEconomyTuning = HustleEconomicTuning;

export interface InfluenceMilestoneMechanics extends HustleEconomicMilestone {
  id: string;
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

const hustleSlots: Readonly<Record<HustleId, HustleEconomicSlotId>> = {
  'troll-network': 'hustle-01',
  'podcast-network': 'hustle-02',
  'culture-war-media': 'hustle-03',
  'masterclass-business': 'hustle-04',
  'manifesto-imprint': 'hustle-05',
  'founder-retreat-circuit': 'hustle-06',
  'ai-venture': 'hustle-07',
  'venture-portfolio': 'hustle-08',
  'media-holdings': 'hustle-09',
  'sovereign-network': 'hustle-10',
};
validateEconomicSlotMapping('influence', hustleOrder, hustleSlots);

const hustles = Object.fromEntries(hustleOrder.map((hustleId) => [
  hustleId,
  HUSTLE_ECONOMIC_SLOTS[hustleSlots[hustleId]].tuning,
])) as Readonly<Record<HustleId, InfluenceHustleEconomyTuning>>;

const milestones = Object.fromEntries(hustleOrder.map((hustleId) => [
  hustleId,
  HUSTLE_ECONOMIC_SLOTS[hustleSlots[hustleId]].milestones.map((entry) => ({
    id: `${hustleId}-${entry.requiredUnits}`,
    ...entry,
  })),
])) as unknown as Readonly<Record<HustleId, readonly InfluenceMilestoneMechanics[]>>;

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
  hustleSlots,
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

function leverageModifier(
  id: string,
  kind: ModifierKind,
  value: number,
  hustleIds?: readonly HustleId[]
): InfluenceLeverageModifierMechanics {
  return { id, scope: hustleIds ? 'synergy' : 'global', kind, value, hustleIds };
}
