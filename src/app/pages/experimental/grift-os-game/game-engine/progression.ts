import { CampaignStratumMechanics, GameMechanics, GameUnlock } from './mechanics';

export function campaignStratumForNetWorth(
  peakNetWorth: number,
  mechanics: GameMechanics
): CampaignStratumMechanics {
  const safeNetWorth = Math.max(0, Number.isFinite(peakNetWorth) ? peakNetWorth : 0);

  return [...mechanics.campaignStrata]
    .reverse()
    .find((stratum) => safeNetWorth >= stratum.minimumNetWorth) ?? mechanics.campaignStrata[0];
}

export function rugPullTargetForNetWorth(peakNetWorth: number, mechanics: GameMechanics): number {
  return campaignStratumForNetWorth(peakNetWorth, mechanics).rugPullTarget;
}

export function campaignComplete(currentNetWorth: number, mechanics: GameMechanics): boolean {
  return currentNetWorth >= mechanics.prestige.campaignTargetNetWorth;
}

export function newlyUnlockedMechanics(
  currentPeakNetWorth: number,
  resultingPeakNetWorth: number,
  mechanics: GameMechanics
): readonly GameUnlock[] {
  const unlocks: GameUnlock[] = [];

  for (const definition of mechanics.leverage) {
    if (currentPeakNetWorth < definition.unlockNetWorth && resultingPeakNetWorth >= definition.unlockNetWorth) {
      unlocks.push({ kind: 'leverage', id: definition.id });
    }
  }

  for (const stratum of mechanics.campaignStrata) {
    if (currentPeakNetWorth < stratum.minimumNetWorth && resultingPeakNetWorth >= stratum.minimumNetWorth) {
      unlocks.push({ kind: 'campaign-stratum', id: stratum.id });
    }
  }

  return unlocks;
}
