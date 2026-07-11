import {
  CampaignStratumTuning,
  GRIFT_OS_CAMPAIGN_STRATA,
  GRIFT_OS_PRESTIGE_TUNING,
} from '../content/economy-tuning';
import { LEVERAGE_DEFINITIONS } from '../content/leverage-definitions';
import { GriftOsGameState, HustleDefinition } from './types';

export function campaignStratumForNetWorth(netWorth: number): CampaignStratumTuning {
  const safeNetWorth = Math.max(0, Number.isFinite(netWorth) ? netWorth : 0);

  return [...GRIFT_OS_CAMPAIGN_STRATA]
    .reverse()
    .find((stratum) => safeNetWorth >= stratum.minimumNetWorth) ?? GRIFT_OS_CAMPAIGN_STRATA[0];
}

export function rugPullTargetForNetWorth(netWorth: number): number {
  return campaignStratumForNetWorth(netWorth).rugPullTarget;
}

export function isHustleUnlocked(state: GriftOsGameState, definition: HustleDefinition): boolean {
  return state.netWorth >= definition.unlockNetWorth || state.hustles[definition.id].units > 0;
}

export function campaignComplete(netWorth: number): boolean {
  return netWorth >= GRIFT_OS_PRESTIGE_TUNING.campaignTargetNetWorth;
}

export function newlyUnlockedLabels(
  currentNetWorth: number,
  resultingNetWorth: number,
  definitions: readonly HustleDefinition[] = []
): readonly string[] {
  const labels = new Set<string>();

  for (const definition of definitions) {
    if (currentNetWorth < definition.unlockNetWorth && resultingNetWorth >= definition.unlockNetWorth) {
      labels.add(definition.name);
    }
  }

  for (const definition of LEVERAGE_DEFINITIONS) {
    if (currentNetWorth < definition.unlockNetWorth && resultingNetWorth >= definition.unlockNetWorth) {
      labels.add(definition.name);
    }
  }

  for (const stratum of GRIFT_OS_CAMPAIGN_STRATA) {
    if (currentNetWorth < stratum.minimumNetWorth && resultingNetWorth >= stratum.minimumNetWorth) {
      labels.add(stratum.label);
    }
  }

  return [...labels];
}
