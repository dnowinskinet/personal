import { HustleId, ModifierKind } from '../game-engine/types';

export interface HustleEconomyTuning {
  acquisitionCost: number;
  growthRate: number;
  basePayout: number;
  cadenceSeconds: number;
  automationCost: number;
  initialUnits: number;
  unlockNetWorth: number;
}

export interface MilestoneEconomyTuning {
  requiredUnits: number;
  kind: Exclude<ModifierKind, 'starting-value'>;
  value: number;
  label: string;
  description: string;
  rewardDescription: string;
}

export interface CampaignStratumTuning {
  id: 'attention' | 'doctrine' | 'capital' | 'institutional' | 'sovereignty' | 'postgame';
  label: string;
  minimumNetWorth: number;
  rugPullTarget: number;
  rewardShaping: number;
}

export interface FounderTakeStageTuning {
  id: 'retained-rights' | 'locked-cap-table';
  name: string;
  description: string;
  takeBonus: number;
  costTargetRatio: number;
  durationMs: number;
  outputRetention: number;
}

export const GRIFT_OS_CAMPAIGN_STRATA: readonly CampaignStratumTuning[] = [
  {
    id: 'attention',
    label: 'Creator economy',
    minimumNetWorth: 0,
    rugPullTarget: 100_000_000,
    rewardShaping: 0.1,
  },
  {
    id: 'doctrine',
    label: 'Direct audience economy',
    minimumNetWorth: 1_000_000,
    rugPullTarget: 3_000_000_000,
    rewardShaping: 0.1,
  },
  {
    id: 'capital',
    label: 'Influence economy',
    minimumNetWorth: 30_000_000,
    rugPullTarget: 100_000_000_000,
    rewardShaping: 0.1,
  },
  {
    id: 'institutional',
    label: 'Network economy',
    minimumNetWorth: 1_000_000_000,
    rugPullTarget: 3_000_000_000_000,
    rewardShaping: 0.1,
  },
  {
    id: 'sovereignty',
    label: 'Platform economy',
    minimumNetWorth: 30_000_000_000,
    rugPullTarget: 100_000_000_000_000,
    rewardShaping: 0.1,
  },
  {
    id: 'postgame',
    label: 'Post-victory economy',
    minimumNetWorth: 1_000_000_000_000,
    rugPullTarget: 1_000_000_000_000_000,
    rewardShaping: 0.1,
  },
] as const;

export const GRIFT_OS_HUSTLE_TUNING: Readonly<Record<HustleId, HustleEconomyTuning>> = {
  'troll-network': {
    acquisitionCost: 0.025,
    growthRate: 1.18,
    basePayout: 0.0025,
    cadenceSeconds: 2,
    automationCost: 0.5,
    initialUnits: 1,
    unlockNetWorth: 0,
  },
  'podcast-network': {
    acquisitionCost: 2,
    growthRate: 1.2,
    basePayout: 0.2,
    cadenceSeconds: 5,
    automationCost: 12,
    initialUnits: 0,
    unlockNetWorth: 0,
  },
  'culture-war-media': {
    acquisitionCost: 50,
    growthRate: 1.22,
    basePayout: 8,
    cadenceSeconds: 10,
    automationCost: 300,
    initialUnits: 0,
    unlockNetWorth: 0,
  },
  'masterclass-business': {
    acquisitionCost: 1_500,
    growthRate: 1.24,
    basePayout: 250,
    cadenceSeconds: 20,
    automationCost: 9_000,
    initialUnits: 0,
    unlockNetWorth: 0,
  },
  'manifesto-imprint': {
    acquisitionCost: 50_000,
    growthRate: 1.26,
    basePayout: 8_000,
    cadenceSeconds: 30,
    automationCost: 300_000,
    initialUnits: 0,
    unlockNetWorth: 0,
  },
  'founder-retreat-circuit': {
    acquisitionCost: 2_000_000,
    growthRate: 1.28,
    basePayout: 120_000,
    cadenceSeconds: 45,
    automationCost: 12_000_000,
    initialUnits: 0,
    unlockNetWorth: 1_000_000,
  },
  'ai-venture': {
    acquisitionCost: 75_000_000,
    growthRate: 1.3,
    basePayout: 600_000,
    cadenceSeconds: 60,
    automationCost: 450_000_000,
    initialUnits: 0,
    unlockNetWorth: 30_000_000,
  },
  'venture-portfolio': {
    acquisitionCost: 3_000_000_000,
    growthRate: 1.32,
    basePayout: 30_000_000,
    cadenceSeconds: 90,
    automationCost: 18_000_000_000,
    initialUnits: 0,
    unlockNetWorth: 1_000_000_000,
  },
  'media-holdings': {
    acquisitionCost: 100_000_000_000,
    growthRate: 1.34,
    basePayout: 200_000_000,
    cadenceSeconds: 120,
    automationCost: 500_000_000_000,
    initialUnits: 0,
    unlockNetWorth: 30_000_000_000,
  },
  'sovereign-network': {
    acquisitionCost: 2_000_000_000_000,
    growthRate: 1.36,
    basePayout: 2_000_000_000,
    cadenceSeconds: 180,
    automationCost: 6_000_000_000_000,
    initialUnits: 0,
    unlockNetWorth: 30_000_000_000,
  },
};

export const GRIFT_OS_MILESTONE_TUNING: Readonly<Record<HustleId, readonly MilestoneEconomyTuning[]>> = {
  'troll-network': [
    milestone(10, 'output', 2, 'Rate card: 3x local output', 'Tiny offers become a repeatable commercial format.'),
    milestone(25, 'cadence', 1, 'Link rotation: 2x local cycle speed', 'Every account learns which link belongs under which post.'),
    milestone(50, 'output', 7, 'Talent manager: 10x cumulative local output', 'The Founder is now represented in negotiations worth several dollars.'),
    milestone(100, 'cost', 1, 'Account network: expansion costs divided by 2', 'New pages launch from a reusable creator playbook.'),
  ],
  'podcast-network': [
    milestone(5, 'output', 1.5, 'Premium feed: 2.5x local output', 'Members discover that access can have more than one price.'),
    milestone(15, 'automation-cost', 1, 'Renewal tooling: automation cost divided by 2', 'Billing becomes less intimate and substantially more reliable.'),
    milestone(30, 'cadence', 1, 'Annual plans: 2x local cycle speed', 'Commitment is collected before enthusiasm can cool.'),
    milestone(75, 'output', 8.5, 'Patron hierarchy: 11x cumulative local output', 'Status becomes the premium content.'),
  ],
  'culture-war-media': [
    milestone(5, 'output', 2, 'Limited edition: 3x local output', 'Scarcity makes ordinary fabric historically important.'),
    milestone(20, 'cadence', 0.75, 'Drop calendar: 1.75x local cycle speed', 'The next launch begins before the last boxes leave.'),
    milestone(40, 'output', 8, 'Signed inventory: 11x cumulative local output', 'A signature discovers a wholesale margin.'),
    milestone(100, 'cost', 1.5, 'White-label supply: expansion costs divided by 2.5', 'New drops now arrive mostly designed and completely urgent.'),
  ],
  'masterclass-business': [
    milestone(5, 'automation-cost', 1, 'Ad inventory system: automation cost divided by 2', 'Sponsor slots acquire names, dates, and a sales pipeline.'),
    milestone(15, 'output', 3, 'Endorsement package: 4x local output', 'A personal recommendation becomes a multi-platform deliverable.'),
    milestone(35, 'cadence', 1, 'Daily format: 2x local cycle speed', 'The show becomes frequent enough to forget why it started.'),
    milestone(75, 'output', 12, 'Syndication: 16x cumulative local output', 'The same personality can now occupy several feeds at once.'),
  ],
  'manifesto-imprint': [
    milestone(5, 'output', 3, 'VIP package: 4x local output', 'A ticket becomes a photo, a signature, and a controlled moment of eye contact.'),
    milestone(15, 'cadence', 1, 'Tour routing: 2x local cycle speed', 'The travel day is finally monetized.'),
    milestone(30, 'cost', 1, 'Venue partnership: expansion costs divided by 2', 'Cities begin competing to host the Founder economy.'),
    milestone(60, 'output', 15, 'Corporate keynote: 19x cumulative local output', 'The appearance circuit discovers procurement budgets.'),
  ],
  'founder-retreat-circuit': [
    milestone(3, 'output', 4, 'Advancement fee: 5x local output', 'Members discover that belonging has levels.'),
    milestone(10, 'automation-cost', 1, 'Chapter officers: automation cost divided by 2', 'Local loyalists begin collecting dues from one another.'),
    milestone(25, 'cadence', 1.5, 'Loyalty calendar: 2.5x local cycle speed', 'Every month now contains a reason to recommit.'),
    milestone(50, 'output', 10, 'Founder audience: 15x cumulative local output', 'Premium access becomes a permanent social rank.'),
  ],
  'ai-venture': [
    milestone(3, 'output', 5, 'Matching challenge: 6x local output', 'One emergency now validates the next emergency.'),
    milestone(10, 'cadence', 1, 'Rapid response: 2x local cycle speed', 'The fundraising copy is drafted before the offense occurs.'),
    milestone(25, 'cost', 1.5, 'Reusable crisis stack: expansion costs divided by 2.5', 'Every campaign ships with the same payment rails and a new deadline.'),
    milestone(50, 'output', 15, 'Permanent emergency: 21x cumulative local output', 'Ordinary operations become a continuous rescue mission.'),
  ],
  'venture-portfolio': [
    milestone(2, 'output', 7, 'Founder allocation: 8x local output', 'The community learns that privileged access is itself the product.'),
    milestone(8, 'automation-cost', 1.5, 'Token desk: automation cost divided by 2.5', 'Presales, claims, and replacement assets share one operating team.'),
    milestone(20, 'cadence', 1.5, 'Rolling presale: 2.5x local cycle speed', 'The next issue opens before the prior community finishes migrating.'),
    milestone(40, 'output', 10, 'Treasury control: 18x cumulative local output', 'Belief now clears through a balance sheet the Founder controls.'),
  ],
  'media-holdings': [
    milestone(2, 'output', 9, 'Bundled campaign: 10x local output', 'Two personalities become a network in the sales deck.'),
    milestone(6, 'cost', 1.5, 'Talent pipeline: expansion costs divided by 2.5', 'New personalities arrive with audiences and negotiable principles.'),
    milestone(15, 'cadence', 2, 'Always-on inventory: 3x local cycle speed', 'Every feed can carry the same campaign on a different day.'),
    milestone(30, 'output', 10, 'Category ownership: 20x cumulative local output', 'Brands stop buying shows and start buying the entire conversation.'),
  ],
  'sovereign-network': [
    milestone(2, 'output', 4, 'Auction density: 5x local output', 'More buyers discover the same second of human attention.'),
    milestone(5, 'automation-cost', 2, 'Self-serve ads: automation cost divided by 3', 'Advertisers begin constructing their own reasons to interrupt people.'),
    milestone(12, 'cadence', 1, 'Real-time exchange: 2x local cycle speed', 'Every impression becomes an auction before anyone notices it happened.'),
    milestone(25, 'output', 10, 'Attention monopoly: 15x cumulative local output', 'The Founder no longer sells access to an audience. The Founder sells the market.'),
  ],
};

export const GRIFT_OS_PRESTIGE_TUNING = {
  unlockValuation: GRIFT_OS_CAMPAIGN_STRATA[0].rugPullTarget,
  netWorthGainExponent: 0.75,
  wealthAdvantageBase: 1_000_000,
  wealthAdvantageCoefficient: 4,
  wealthAdvantageExponent: 0.2,
  frontierWealthFactor: 0.05,
  priorStratumWealthFactor: 0.25,
  campaignTargetNetWorth: 1_000_000_000_000,
  curatedValuationEnvelope: 1_000_000_000_000_000,
} as const;

export const GRIFT_OS_FOUNDER_TAKE_TUNING = {
  baseTake: 0.1,
  stages: [
    {
      id: 'retained-rights',
      name: 'Retain the Rights',
      description: 'Slow growth while counsel moves the valuable rights back onto the Founder side of the table.',
      takeBonus: 0.05,
      costTargetRatio: 0.03,
      durationMs: 2 * 60 * 60 * 1000,
      outputRetention: 0.75,
    },
    {
      id: 'locked-cap-table',
      name: 'Lock the Cap Table',
      description: 'Trade a full operating window for enough control to capture another five points of the exit.',
      takeBonus: 0.05,
      costTargetRatio: 0.07,
      durationMs: 6 * 60 * 60 * 1000,
      outputRetention: 0.6,
    },
  ] as const satisfies readonly FounderTakeStageTuning[],
} as const;

function milestone(
  requiredUnits: number,
  kind: MilestoneEconomyTuning['kind'],
  value: number,
  label: string,
  description: string
): MilestoneEconomyTuning {
  return {
    requiredUnits,
    kind,
    value,
    label,
    description,
    rewardDescription: label,
  };
}
