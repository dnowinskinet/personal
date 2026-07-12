import { INFLUENCE_CONTENT_PACK } from '../empires/influence/content/influence-content';
import { INFLUENCE_ENGINE_MECHANICS } from '../empires/influence/mechanics/influence-mechanics';
import {
  commitRugPull as commitMechanicalRugPull,
  createRugPullPreview as createMechanicalRugPullPreview,
  projectedNetWorthGain as projectedMechanicalNetWorthGain,
  RugPullCommitResult,
  RugPullMechanicsPreview,
} from '../game-engine/rug-pull';
import { GriftOsGameState } from '../game-engine/types';

export const RUG_PULL_CONFIG = INFLUENCE_ENGINE_MECHANICS.prestige;

export interface RugPullPreview extends Omit<RugPullMechanicsPreview, 'campaignStratumId' | 'newlyUnlocked'> {
  campaignStratumLabel: string;
  newlyUnlocked: readonly string[];
}

export function createRugPullPreview(state: GriftOsGameState): RugPullPreview {
  const preview = createMechanicalRugPullPreview(state, INFLUENCE_ENGINE_MECHANICS);

  return {
    ...preview,
    campaignStratumLabel: campaignLabel(preview.campaignStratumId),
    newlyUnlocked: preview.newlyUnlocked.map((unlock) => unlock.kind === 'leverage'
      ? INFLUENCE_CONTENT_PACK.leverage[unlock.id].name
      : campaignLabel(unlock.id)),
  };
}

export function commitRugPull(state: GriftOsGameState): RugPullCommitResult {
  return commitMechanicalRugPull(state, INFLUENCE_ENGINE_MECHANICS);
}

export function projectedNetWorthGain(
  peakValuation: number,
  currentNetWorth = 0,
  takeRate = INFLUENCE_ENGINE_MECHANICS.founderTake.baseTake
): number {
  return projectedMechanicalNetWorthGain(
    peakValuation,
    currentNetWorth,
    takeRate,
    INFLUENCE_ENGINE_MECHANICS
  );
}

function campaignLabel(id: string): string {
  const labels = INFLUENCE_CONTENT_PACK.campaignStrata as Readonly<Record<string, string>>;

  return labels[id] ?? id;
}
