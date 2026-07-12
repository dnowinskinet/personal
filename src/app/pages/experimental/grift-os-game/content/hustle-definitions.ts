import { INFLUENCE_CONTENT_PACK } from '../empires/influence/content/influence-content';
import {
  INFLUENCE_ENGINE_MECHANICS,
  INFLUENCE_MECHANICS_PACK,
} from '../empires/influence/mechanics/influence-mechanics';
import { GameMechanics } from '../game-engine/mechanics';
import {
  HustleDefinition,
  HustleIconKind,
  HustleId,
  ModifierDefinition,
} from '../game-engine/types';
import { GRIFT_OS_HUSTLE_TUNING, GRIFT_OS_MILESTONE_TUNING } from './economy-tuning';

interface LegacyHustlePresentation {
  iconKind: HustleIconKind;
  audio: NonNullable<HustleDefinition['audio']>;
}

// Visual/audio ownership is intentionally unchanged until its approved migration phase.
const LEGACY_HUSTLE_PRESENTATION: Readonly<Record<HustleId, LegacyHustlePresentation>> = {
  'troll-network': appearance('signal', 'creator-scroll'),
  'podcast-network': appearance('broadcast', 'member-chime'),
  'culture-war-media': appearance('outrage', 'fulfillment-line'),
  'masterclass-business': appearance('funnel', 'studio-clock'),
  'manifesto-imprint': appearance('manifesto', 'venue-crowd'),
  'founder-retreat-circuit': appearance('summit', 'inner-circle'),
  'ai-venture': appearance('ai', 'donation-counter'),
  'venture-portfolio': appearance('fund', 'token-ticks'),
  'media-holdings': appearance('media', 'network-bed'),
  'sovereign-network': appearance('sovereignty', 'platform-exchange'),
};

export const HUSTLE_DEFINITIONS: readonly HustleDefinition[] & GameMechanics = Object.assign(
  INFLUENCE_MECHANICS_PACK.hustleOrder.map((hustleId, index) => ({
    id: hustleId,
    ...GRIFT_OS_HUSTLE_TUNING[hustleId],
    ...INFLUENCE_CONTENT_PACK.hustles[hustleId],
    order: index + 1,
    ...LEGACY_HUSTLE_PRESENTATION[hustleId],
    milestones: milestoneSet(hustleId),
  })),
  {
    leverage: INFLUENCE_ENGINE_MECHANICS.leverage,
    campaignStrata: INFLUENCE_ENGINE_MECHANICS.campaignStrata,
    prestige: INFLUENCE_ENGINE_MECHANICS.prestige,
    founderTake: INFLUENCE_ENGINE_MECHANICS.founderTake,
  }
);

function milestoneSet(hustleId: HustleId): HustleDefinition['milestones'] {
  const unitPlural = INFLUENCE_CONTENT_PACK.hustles[hustleId].unitPlural;

  return GRIFT_OS_MILESTONE_TUNING[hustleId].map((milestone) => ({
    id: milestone.id,
    requiredUnits: milestone.requiredUnits,
    name: `${milestone.requiredUnits} ${unitPlural}`,
    description: milestone.description,
    reward: milestoneReward(hustleId, milestone),
  }));
}

function milestoneReward(
  hustleId: HustleId,
  milestone: (typeof GRIFT_OS_MILESTONE_TUNING)[HustleId][number]
): ModifierDefinition {
  return {
    id: `${hustleId}-units-${milestone.requiredUnits}-${milestone.kind}`,
    label: milestone.label,
    description: milestone.rewardDescription,
    scope: 'hustle',
    kind: milestone.kind,
    value: milestone.value,
    hustleId,
    source: 'milestone',
  };
}

function appearance(iconKind: HustleIconKind, ambientSignature: string): LegacyHustlePresentation {
  return {
    iconKind,
    audio: {
      manualActionCue: 'manual-click',
      automationCue: 'automation-online',
      ambientSignature,
    },
  };
}
