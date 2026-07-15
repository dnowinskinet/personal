import { INFLUENCE_CONTENT_PACK } from '../empires/influence/content/influence-content';
import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import {
  extractionStatus as mechanicalExtractionStatus,
  ExtractionStatus as MechanicalExtractionStatus,
  startExtractionPreparation as startMechanicalExtractionPreparation,
} from '../game-engine/extraction';
import { ExtractionStageMechanics } from '../game-engine/mechanics';
import { ExtractionPreparationResult, GriftOsGameState } from '../game-engine/types';

export interface ExtractionStage extends ExtractionStageMechanics {
  name: string;
  description: string;
}

export interface ExtractionStatus extends Omit<MechanicalExtractionStatus, 'activeStage' | 'nextStage'> {
  activeStage: ExtractionStage | null;
  nextStage: ExtractionStage | null;
}

export function extractionStatus(state: GriftOsGameState): ExtractionStatus {
  const status = mechanicalExtractionStatus(state, INFLUENCE_ENGINE_MECHANICS);

  return {
    ...status,
    activeStage: enrichStage(status.activeStage),
    nextStage: enrichStage(status.nextStage),
  };
}

export function startExtractionPreparation(
  state: GriftOsGameState
): ExtractionPreparationResult {
  return startMechanicalExtractionPreparation(state, INFLUENCE_ENGINE_MECHANICS);
}

function enrichStage(stage: ExtractionStageMechanics | null): ExtractionStage | null {
  if (!stage) {
    return null;
  }

  const content = INFLUENCE_CONTENT_PACK.extraction[
    stage.id as keyof typeof INFLUENCE_CONTENT_PACK.extraction
  ];

  return { ...stage, ...content };
}
