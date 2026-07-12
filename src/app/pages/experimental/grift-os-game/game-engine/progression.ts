import { CampaignStratumMechanics, GameMechanics, GameUnlock } from './mechanics';

export function campaignStratumForNetWorth(
  netWorth: number,
  mechanics: GameMechanics
): CampaignStratumMechanics {
  const safeNetWorth = Math.max(0, Number.isFinite(netWorth) ? netWorth : 0);

  return [...mechanics.campaignStrata]
    .reverse()
    .find((stratum) => safeNetWorth >= stratum.minimumNetWorth) ?? mechanics.campaignStrata[0];
}

export function rugPullTargetForNetWorth(netWorth: number, mechanics: GameMechanics): number {
  return campaignStratumForNetWorth(netWorth, mechanics).rugPullTarget;
}

export function campaignComplete(netWorth: number, mechanics: GameMechanics): boolean {
  return netWorth >= mechanics.prestige.campaignTargetNetWorth;
}

export function newlyUnlockedMechanics(
  currentNetWorth: number,
  resultingNetWorth: number,
  mechanics: GameMechanics
): readonly GameUnlock[] {
  const unlocks: GameUnlock[] = [];

  for (const definition of mechanics.leverage) {
    if (currentNetWorth < definition.unlockNetWorth && resultingNetWorth >= definition.unlockNetWorth) {
      unlocks.push({ kind: 'leverage', id: definition.id });
    }
  }

  for (const stratum of mechanics.campaignStrata) {
    if (currentNetWorth < stratum.minimumNetWorth && resultingNetWorth >= stratum.minimumNetWorth) {
      unlocks.push({ kind: 'campaign-stratum', id: stratum.id });
    }
  }

  return unlocks;
}
