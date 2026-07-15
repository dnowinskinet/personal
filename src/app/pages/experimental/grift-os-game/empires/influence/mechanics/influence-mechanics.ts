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

export type InfluenceExtractionStageId = 'retained-rights' | 'locked-cap-table';

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

export interface InfluenceExtractionStageMechanics {
  id: InfluenceExtractionStageId;
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
  'online-rage-farm',
  'paid-friend-club',
  'autograph-factory',
  'paid-shoutout-studio',
  'outrage-podcast',
  'get-rich-books',
  'paid-endorsement-racket',
  'vip-experience-tour',
  'success-university',
  'mlm-ambassador-program',
  'debt-club',
  'subscriber-towns',
];

const hustleSlots: Readonly<Record<HustleId, HustleEconomicSlotId>> = {
  'online-rage-farm': 'hustle-01',
  'paid-friend-club': 'hustle-02',
  'autograph-factory': 'hustle-03',
  'paid-shoutout-studio': 'hustle-04',
  'outrage-podcast': 'hustle-05',
  'get-rich-books': 'hustle-06',
  'paid-endorsement-racket': 'hustle-07',
  'vip-experience-tour': 'hustle-08',
  'success-university': 'hustle-09',
  'mlm-ambassador-program': 'hustle-10',
  'debt-club': 'hustle-11',
  'subscriber-towns': 'hustle-12',
};
validateEconomicSlotMapping('influence', hustleOrder, hustleSlots);

const hustles = Object.fromEntries(hustleOrder.map((hustleId) => [
  hustleId,
  HUSTLE_ECONOMIC_SLOTS[hustleSlots[hustleId]].tuning,
])) as Readonly<Record<HustleId, InfluenceHustleEconomyTuning>>;

const milestones = Object.fromEntries(hustleOrder.map((hustleId) => [
  hustleId,
  HUSTLE_ECONOMIC_SLOTS[hustleSlots[hustleId]].milestones.map((entry) => ({
    id: `${hustleId}-${entry.requiredScaleCount}`,
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

const extraction = {
  baseTake: 0.1,
  stages: [
    { id: 'retained-rights', takeBonus: 0.05, costTargetRatio: 0.03, durationMs: 2 * 60 * 60 * 1000, outputRetention: 0.75 },
    { id: 'locked-cap-table', takeBonus: 0.05, costTargetRatio: 0.07, durationMs: 6 * 60 * 60 * 1000, outputRetention: 0.6 },
  ] as const satisfies readonly InfluenceExtractionStageMechanics[],
} as const;

const leverage: readonly InfluenceLeverageMechanics[] = [
  {
    id: 'attention-loop', domain: 'attention', cost: 250_000, unlockNetWorth: 1_000_000,
    requiredOwnedHustles: ['paid-shoutout-studio'],
    requiredAutomatedHustles: ['online-rage-farm', 'paid-friend-club', 'autograph-factory'],
    modifiers: [leverageModifier('attention-loop-output', 'output', 1, ['online-rage-farm', 'paid-friend-club', 'autograph-factory', 'paid-shoutout-studio'])],
  },
  {
    id: 'closed-circuit-doctrine', domain: 'doctrine', cost: 2_000_000, unlockNetWorth: 30_000_000,
    requiredOwnedHustles: ['get-rich-books'],
    requiredAutomatedHustles: ['outrage-podcast', 'get-rich-books'],
    modifiers: [
      leverageModifier('closed-circuit-doctrine-output', 'output', 1, ['outrage-podcast', 'get-rich-books', 'paid-endorsement-racket']),
      leverageModifier('closed-circuit-doctrine-cost', 'cost', 0.5),
    ],
  },
  {
    id: 'capital-access', domain: 'capital', cost: 25_000_000, unlockNetWorth: 30_000_000,
    requiredOwnedHustles: ['vip-experience-tour'],
    requiredAutomatedHustles: ['paid-endorsement-racket', 'vip-experience-tour'],
    modifiers: [
      leverageModifier('capital-access-output', 'output', 1, ['paid-endorsement-racket', 'vip-experience-tour', 'success-university']),
      leverageModifier('capital-access-automation', 'automation-cost', 1),
    ],
  },
  {
    id: 'institutional-capture', domain: 'capital', cost: 250_000_000, unlockNetWorth: 1_000_000_000,
    requiredOwnedHustles: ['mlm-ambassador-program'],
    requiredAutomatedHustles: ['success-university', 'mlm-ambassador-program'],
    modifiers: [
      leverageModifier('institutional-capture-output', 'output', 1, ['success-university', 'mlm-ambassador-program', 'debt-club']),
      leverageModifier('institutional-capture-speed', 'cadence', 0.5, ['success-university', 'debt-club']),
    ],
  },
  {
    id: 'sovereign-stack', domain: 'sovereignty', cost: 2_500_000_000, unlockNetWorth: 30_000_000_000,
    requiredOwnedHustles: ['subscriber-towns'],
    requiredAutomatedHustles: ['debt-club'],
    modifiers: [
      leverageModifier('sovereign-stack-output', 'output', 2, ['debt-club', 'subscriber-towns']),
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
  extraction,
  leverage,
} as const;

export const INFLUENCE_ENGINE_MECHANICS: GameMechanics = Object.assign(
  hustleOrder.map((hustleId) => ({
    id: hustleId,
    ...hustles[hustleId],
    milestones: milestones[hustleId].map((entry) => ({
      id: entry.id,
      requiredScaleCount: entry.requiredScaleCount,
      reward: {
        id: `${hustleId}-scale-${entry.requiredScaleCount}-${entry.kind}`,
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
    extraction,
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
