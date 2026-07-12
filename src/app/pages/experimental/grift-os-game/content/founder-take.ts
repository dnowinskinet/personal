import { INFLUENCE_CONTENT_PACK } from '../empires/influence/content/influence-content';
import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import {
  founderTakeStatus as mechanicalFounderTakeStatus,
  FounderTakeStatus as MechanicalFounderTakeStatus,
  startFounderTakePreparation as startMechanicalFounderTakePreparation,
} from '../game-engine/founder-take';
import { FounderTakeStageMechanics } from '../game-engine/mechanics';
import { FounderTakePreparationResult, GriftOsGameState } from '../game-engine/types';

export interface FounderTakeStage extends FounderTakeStageMechanics {
  name: string;
  description: string;
}

export interface FounderTakeStatus extends Omit<MechanicalFounderTakeStatus, 'activeStage' | 'nextStage'> {
  activeStage: FounderTakeStage | null;
  nextStage: FounderTakeStage | null;
}

export function founderTakeStatus(state: GriftOsGameState): FounderTakeStatus {
  const status = mechanicalFounderTakeStatus(state, INFLUENCE_ENGINE_MECHANICS);

  return {
    ...status,
    activeStage: enrichStage(status.activeStage),
    nextStage: enrichStage(status.nextStage),
  };
}

export function startFounderTakePreparation(
  state: GriftOsGameState
): FounderTakePreparationResult {
  return startMechanicalFounderTakePreparation(state, INFLUENCE_ENGINE_MECHANICS);
}

function enrichStage(stage: FounderTakeStageMechanics | null): FounderTakeStage | null {
  if (!stage) {
    return null;
  }

  const content = INFLUENCE_CONTENT_PACK.founderTake[
    stage.id as keyof typeof INFLUENCE_CONTENT_PACK.founderTake
  ];

  return { ...stage, ...content };
}
