import { INFLUENCE_CONTENT_PACK } from '../empires/influence/content/influence-content';
import {
  INFLUENCE_MECHANICS_PACK,
  InfluenceCampaignStratumId,
  InfluenceFounderTakeStageId,
  InfluenceHustleEconomyTuning,
  InfluenceMilestoneMechanics,
} from '../empires/influence/mechanics/influence-mechanics';
import { HustleId } from '../game-engine/types';

// Compatibility exports preserve the current engine/component import surface until Phase C.
export type HustleEconomyTuning = InfluenceHustleEconomyTuning;

export interface MilestoneEconomyTuning extends InfluenceMilestoneMechanics {
  label: string;
  description: string;
  rewardDescription: string;
}

export interface CampaignStratumTuning {
  id: InfluenceCampaignStratumId;
  label: string;
  minimumNetWorth: number;
  rugPullTarget: number;
  rewardShaping: number;
}

export interface FounderTakeStageTuning {
  id: InfluenceFounderTakeStageId;
  name: string;
  description: string;
  takeBonus: number;
  costTargetRatio: number;
  durationMs: number;
  outputRetention: number;
}

export const GRIFT_OS_HUSTLE_TUNING: Readonly<Record<HustleId, HustleEconomyTuning>> =
  INFLUENCE_MECHANICS_PACK.hustles;

export const GRIFT_OS_MILESTONE_TUNING: Readonly<Record<HustleId, readonly MilestoneEconomyTuning[]>> =
  Object.fromEntries(
    INFLUENCE_MECHANICS_PACK.hustleOrder.map((hustleId) => [
      hustleId,
      INFLUENCE_MECHANICS_PACK.milestones[hustleId].map((mechanics) => ({
        ...mechanics,
        ...requiredMilestoneContent(mechanics.id),
      })),
    ])
  ) as unknown as Readonly<Record<HustleId, readonly MilestoneEconomyTuning[]>>;

export const GRIFT_OS_CAMPAIGN_STRATA: readonly CampaignStratumTuning[] =
  INFLUENCE_MECHANICS_PACK.campaignStrata.map((stratum) => ({
    ...stratum,
    label: INFLUENCE_CONTENT_PACK.campaignStrata[stratum.id],
  }));

export const GRIFT_OS_PRESTIGE_TUNING = INFLUENCE_MECHANICS_PACK.prestige;

export const GRIFT_OS_FOUNDER_TAKE_TUNING = {
  baseTake: INFLUENCE_MECHANICS_PACK.founderTake.baseTake,
  stages: INFLUENCE_MECHANICS_PACK.founderTake.stages.map((stage) => ({
    ...stage,
    ...INFLUENCE_CONTENT_PACK.founderTake[stage.id],
  })) as readonly FounderTakeStageTuning[],
} as const;

function requiredMilestoneContent(milestoneId: string) {
  const content = INFLUENCE_CONTENT_PACK.milestones[milestoneId];

  if (!content) {
    throw new Error(`Missing Influence milestone content: ${milestoneId}`);
  }

  return content;
}
