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
    milestone(10, 'output', 2, 'Rate card: 3x local output', 'Tiny recommendations become a repeatable commercial format.'),
    milestone(25, 'cadence', 1, 'Link rotation: 2x local cycle speed', 'Every follower learns which link belongs under which post.'),
    milestone(50, 'output', 7, 'Brand manager: 10x cumulative local output', 'The Founder is now represented in negotiations worth several dollars.'),
    milestone(100, 'cost', 1, 'Follower network: expansion costs divided by 2', 'New audiences launch from a reusable creator playbook.'),
  ],
  'podcast-network': [
    milestone(5, 'output', 1.5, 'Member perks: 2.5x local output', 'Members discover that access can have more than one price.'),
    milestone(15, 'automation-cost', 1, 'Renewal tooling: automation cost divided by 2', 'Billing becomes less intimate and substantially more reliable.'),
    milestone(30, 'cadence', 1, 'Annual dues: 2x local cycle speed', 'Commitment is collected before enthusiasm can cool.'),
    milestone(75, 'output', 8.5, 'Status ladder: 11x cumulative local output', 'Status becomes the premium content.'),
  ],
  'culture-war-media': [
    milestone(5, 'output', 2, 'Limited edition: 3x local output', 'Scarcity makes ordinary products historically important.'),
    milestone(20, 'cadence', 0.75, 'Product calendar: 1.75x local cycle speed', 'The next release begins before the last boxes leave.'),
    milestone(40, 'output', 8, 'Signed inventory: 11x cumulative local output', 'A signature discovers a wholesale margin.'),
    milestone(100, 'cost', 1.5, 'White-label supply: expansion costs divided by 2.5', 'New products now arrive mostly designed and completely urgent.'),
  ],
  'masterclass-business': [
    milestone(5, 'automation-cost', 1, 'Ad inventory system: automation cost divided by 2', 'Sponsor spots acquire names, dates, and a sales pipeline.'),
    milestone(15, 'output', 3, 'Endorsement package: 4x local output', 'A personal recommendation becomes a multi-platform deliverable.'),
    milestone(35, 'cadence', 1, 'Daily format: 2x local cycle speed', 'The podcast becomes frequent enough to forget why it started.'),
    milestone(75, 'output', 12, 'Syndication: 16x cumulative local output', 'The same voice can now occupy several feeds at once.'),
  ],
  'manifesto-imprint': [
    milestone(5, 'output', 3, 'VIP package: 4x local output', 'A ticket becomes a photo, a signature, and a controlled moment of eye contact.'),
    milestone(15, 'cadence', 1, 'City routing: 2x local cycle speed', 'The travel day is finally monetized.'),
    milestone(30, 'cost', 1, 'Venue partnership: expansion costs divided by 2', 'Cities begin competing to host the Founder economy.'),
    milestone(60, 'output', 15, 'Corporate keynote: 19x cumulative local output', 'VIP events discover procurement budgets.'),
  ],
  'founder-retreat-circuit': [
    milestone(3, 'output', 4, 'Enrollment fee: 5x local output', 'Students discover that success has levels.'),
    milestone(10, 'automation-cost', 1, 'Campus staff: automation cost divided by 2', 'Junior staff begin processing the next class.'),
    milestone(25, 'cadence', 1.5, 'Course calendar: 2.5x local cycle speed', 'Every month now contains a reason to enroll again.'),
    milestone(50, 'output', 10, 'Founder curriculum: 15x cumulative local output', 'The Founder’s success becomes a permanent course catalog.'),
  ],
  'ai-venture': [
    milestone(3, 'output', 5, 'Sign-up kit: 6x local output', 'One ambassador sign-up validates the next.'),
    milestone(10, 'cadence', 1, 'Promotion script: 2x local cycle speed', 'The pitch is ready before the next ambassador asks a question.'),
    milestone(25, 'cost', 1.5, 'Ambassador portal: expansion costs divided by 2.5', 'Every ambassador receives the same payment link and a new target.'),
    milestone(50, 'output', 15, 'Recruiting network: 21x cumulative local output', 'Ordinary supporters become a permanent promotion force.'),
  ],
  'venture-portfolio': [
    milestone(2, 'output', 7, 'Regional launch: 8x local output', 'The Founder’s method now has coaches in more than one market.'),
    milestone(8, 'automation-cost', 1.5, 'Scheduling office: automation cost divided by 2.5', 'Bookings and coaches share one operating team.'),
    milestone(20, 'cadence', 1.5, 'Regional rollout: 2.5x local cycle speed', 'The next region opens before the prior one finishes onboarding.'),
    milestone(40, 'output', 10, 'Licensed method: 18x cumulative local output', 'The Founder’s promise now travels through a credentialed workforce.'),
  ],
  'media-holdings': [
    milestone(2, 'output', 9, 'Member Credit Card: 10x local output', 'A bank turns community rewards into a permanent payment rail.'),
    milestone(6, 'cost', 1.5, 'Fee network: expansion costs divided by 2.5', 'New banks arrive with members, annual fees, and payment plans.'),
    milestone(15, 'cadence', 2, 'Automatic payments: 3x local cycle speed', 'Minimum payments keep the money moving every day.'),
    milestone(30, 'output', 10, 'Debt ownership: 20x cumulative local output', 'The Founder stops selling access and starts owning the balances.'),
  ],
  'sovereign-network': [
    milestone(2, 'output', 4, 'Model towns: 5x local output', 'More buyers discover the same branded version of home.'),
    milestone(5, 'automation-cost', 2, 'HOA portal: automation cost divided by 3', 'Residents begin constructing their own reasons to follow the rules.'),
    milestone(12, 'cadence', 1, 'Automatic dues: 2x local cycle speed', 'Every town becomes a recurring charge before anyone notices it happened.'),
    milestone(25, 'output', 10, 'Community control: 15x cumulative local output', 'The Founder no longer sells access to an audience. The Founder sells the rules.'),
  ],
};

export const GRIFT_OS_PRESTIGE_TUNING = {
  unlockValuation: GRIFT_OS_CAMPAIGN_STRATA[0].rugPullTarget,
  netWorthGainExponent: 0.75,
  wealthAdvantageBase: 1_000_000,
  wealthAdvantageCoefficient: 4,
  wealthAdvantageExponent: 0.3,
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
