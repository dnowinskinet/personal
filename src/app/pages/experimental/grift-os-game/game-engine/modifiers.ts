import {
  GriftOsGameState,
  HustleDefinition,
  HustleId,
  ModifierDefinition,
  ModifierKind,
  ModifierScope,
} from './types';
import { GRIFT_OS_CAMPAIGN_STRATA, GRIFT_OS_PRESTIGE_TUNING } from '../content/economy-tuning';
import { LEVERAGE_DEFINITIONS } from '../content/leverage-definitions';
import { founderTakeOutputRetention } from './founder-take';

export interface ModifierBuckets {
  local: number;
  global: number;
  synergy: number;
  temporary: number;
  meta: number;
}

export interface ModifierBreakdown {
  output: ModifierBuckets;
  cadence: ModifierBuckets;
  cost: ModifierBuckets;
  automationCost: ModifierBuckets;
}

const EMPTY_BUCKETS: ModifierBuckets = {
  local: 1,
  global: 1,
  synergy: 1,
  temporary: 1,
  meta: 1,
};

export function createMetaOutputModifier(
  netWorth: number,
  definition: HustleDefinition
): ModifierDefinition {
  return {
    id: `net-worth-wealth-advantage-${definition.id}`,
    label: 'Wealth Advantage',
    description: 'Permanent Net Worth makes established Hustles easier to rebuild than the frontier.',
    scope: 'hustle',
    kind: 'output',
    value: wealthAdvantageBonusForHustle(netWorth, definition),
    hustleId: definition.id,
    source: 'rug-pull',
  };
}

export function wealthAdvantageMultiplier(netWorth: number): number {
  return 1 + wealthAdvantageBonus(netWorth);
}

export function wealthAdvantageBonus(netWorth: number): number {
  const safeNetWorth = Math.max(0, finiteOrZero(netWorth));

  return GRIFT_OS_PRESTIGE_TUNING.wealthAdvantageCoefficient *
    (safeNetWorth / GRIFT_OS_PRESTIGE_TUNING.wealthAdvantageBase) **
      GRIFT_OS_PRESTIGE_TUNING.wealthAdvantageExponent;
}

export function wealthAdvantageMultiplierForHustle(
  netWorth: number,
  definition: HustleDefinition
): number {
  return 1 + wealthAdvantageBonusForHustle(netWorth, definition);
}

export function wealthAdvantageBonusForHustle(
  netWorth: number,
  definition: HustleDefinition
): number {
  const fullBonus = wealthAdvantageBonus(netWorth);

  if (fullBonus <= 0 || definition.unlockNetWorth <= 0) {
    return fullBonus;
  }

  const currentStratumIndex = stratumIndexForNetWorth(netWorth);
  const hustleStratumIndex = stratumIndexForNetWorth(definition.unlockNetWorth);
  const distance = currentStratumIndex - hustleStratumIndex;
  const factor = distance <= 0
    ? GRIFT_OS_PRESTIGE_TUNING.frontierWealthFactor
    : distance === 1
      ? GRIFT_OS_PRESTIGE_TUNING.priorStratumWealthFactor
      : 1;

  return fullBonus * factor;
}

export function collectActiveModifiers(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[]
): ModifierDefinition[] {
  const milestoneModifiers = definitions.flatMap((definition) => {
    const hustle = state.hustles[definition.id];

    return definition.milestones
      .filter((milestone) => hustle.reachedMilestones.includes(milestone.id))
      .map((milestone) => milestone.reward);
  });
  const leverageModifiers = LEVERAGE_DEFINITIONS
    .filter((definition) => state.leveragePurchases.includes(definition.id))
    .flatMap((definition) => definition.modifiers);
  const founderTakeRetention = founderTakeOutputRetention(state);
  const founderTakeModifiers: ModifierDefinition[] = founderTakeRetention < 1
    ? [{
        id: 'founder-take-output-diversion',
        label: 'Exit preparation output diversion',
        description: 'Operating capacity is being redirected toward the Founder side of the extraction.',
        scope: 'temporary',
        kind: 'output',
        value: founderTakeRetention - 1,
        source: 'system',
      }]
    : [];

  return [
    ...milestoneModifiers,
    ...leverageModifiers,
    ...founderTakeModifiers,
    ...definitions.map((definition) => createMetaOutputModifier(state.netWorth, definition)),
  ].filter((modifier) => Number.isFinite(modifier.value) && modifier.value !== 0);
}

export function modifierBreakdownForHustle(
  state: GriftOsGameState,
  definitions: readonly HustleDefinition[],
  hustleId: HustleId
): ModifierBreakdown {
  const modifiers = collectActiveModifiers(state, definitions)
    .filter((modifier) => appliesToHustle(modifier, hustleId));

  return {
    output: bucketsFor(modifiers, 'output'),
    cadence: bucketsFor(modifiers, 'cadence'),
    cost: bucketsFor(modifiers, 'cost'),
    automationCost: bucketsFor(modifiers, 'automation-cost'),
  };
}

export function combinedMultiplier(buckets: ModifierBuckets): number {
  return buckets.local * buckets.global * buckets.synergy * buckets.temporary * buckets.meta;
}

export function applyOutputModifiers(baseValue: number, breakdown: ModifierBreakdown): number {
  return safePositive(baseValue) * combinedMultiplier(breakdown.output);
}

export function applyCadenceModifiers(baseSeconds: number, breakdown: ModifierBreakdown): number {
  const speedMultiplier = Math.max(0.1, combinedMultiplier(breakdown.cadence));

  return Math.max(0.25, safePositive(baseSeconds) / speedMultiplier);
}

export function applyCostModifiers(baseCost: number, breakdown: ModifierBreakdown): number {
  const discountMultiplier = Math.max(0.05, combinedMultiplier(breakdown.cost));

  return safePositive(baseCost) / discountMultiplier;
}

export function applyAutomationCostModifiers(baseCost: number, breakdown: ModifierBreakdown): number {
  const discountMultiplier = Math.max(0.05, combinedMultiplier(breakdown.automationCost));

  return safePositive(baseCost) / discountMultiplier;
}

function bucketsFor(
  modifiers: readonly ModifierDefinition[],
  kind: ModifierKind
): ModifierBuckets {
  const buckets = { ...EMPTY_BUCKETS };

  for (const modifier of modifiers.filter((candidate) => candidate.kind === kind)) {
    const key = scopeToBucket(modifier.scope);
    buckets[key] += modifier.value;
  }

  return buckets;
}

function appliesToHustle(modifier: ModifierDefinition, hustleId: HustleId): boolean {
  if (modifier.scope === 'hustle') {
    return modifier.hustleId === hustleId;
  }

  if (modifier.hustleIds) {
    return modifier.hustleIds.includes(hustleId);
  }

  return true;
}

function scopeToBucket(scope: ModifierScope): keyof ModifierBuckets {
  switch (scope) {
    case 'hustle':
      return 'local';
    case 'global':
      return 'global';
    case 'synergy':
      return 'synergy';
    case 'temporary':
      return 'temporary';
    case 'meta':
      return 'meta';
  }
}

function safePositive(value: number): number {
  return Math.max(0, finiteOrZero(value));
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function stratumIndexForNetWorth(netWorth: number): number {
  const safeNetWorth = Math.max(0, finiteOrZero(netWorth));

  for (let index = GRIFT_OS_CAMPAIGN_STRATA.length - 1; index >= 0; index -= 1) {
    if (safeNetWorth >= GRIFT_OS_CAMPAIGN_STRATA[index].minimumNetWorth) {
      return index;
    }
  }

  return 0;
}
