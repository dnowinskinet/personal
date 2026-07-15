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
  'online-rage-farm': appearance('signal', 'creator-scroll'),
  'paid-friend-club': appearance('broadcast', 'member-chime'),
  'autograph-factory': appearance('outrage', 'fulfillment-line'),
  'paid-shoutout-studio': appearance('funnel', 'studio-clock'),
  'outrage-podcast': appearance('broadcast', 'studio-clock'),
  'get-rich-books': appearance('manifesto', 'inner-circle'),
  'paid-endorsement-racket': appearance('ai', 'donation-counter'),
  'vip-experience-tour': appearance('summit', 'venue-crowd'),
  'success-university': appearance('fund', 'inner-circle'),
  'mlm-ambassador-program': appearance('signal', 'token-ticks'),
  'debt-club': appearance('media', 'network-bed'),
  'subscriber-towns': appearance('sovereignty', 'platform-exchange'),
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
    extraction: INFLUENCE_ENGINE_MECHANICS.extraction,
  }
);

function milestoneSet(hustleId: HustleId): HustleDefinition['milestones'] {
  const unitPlural = INFLUENCE_CONTENT_PACK.hustles[hustleId].unitPlural;

  return GRIFT_OS_MILESTONE_TUNING[hustleId].map((milestone) => ({
    id: milestone.id,
    requiredScaleCount: milestone.requiredScaleCount,
    name: `${milestone.requiredScaleCount} ${unitPlural}`,
    description: milestone.description,
    reward: milestoneReward(hustleId, milestone),
  }));
}

function milestoneReward(
  hustleId: HustleId,
  milestone: (typeof GRIFT_OS_MILESTONE_TUNING)[HustleId][number]
): ModifierDefinition {
  return {
    id: `${hustleId}-scale-${milestone.requiredScaleCount}-${milestone.kind}`,
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
