import {
  GriftOsGameState,
  HustleId,
  ModifierKind,
  ModifierScope,
} from './types';
import { extractionOutputRetention } from './extraction';
import {
  GameMechanics,
  HustleMechanicsDefinition,
  MechanicalModifierDefinition,
} from './mechanics';

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
  definition: HustleMechanicsDefinition,
  mechanics: GameMechanics
): MechanicalModifierDefinition {
  return {
    id: `net-worth-wealth-advantage-${definition.id}`,
    scope: 'hustle',
    kind: 'output',
    value: wealthAdvantageBonusForHustle(netWorth, definition, mechanics),
    hustleId: definition.id,
    source: 'rug-pull',
  };
}

export function wealthAdvantageMultiplier(netWorth: number, mechanics: GameMechanics): number {
  return 1 + wealthAdvantageBonus(netWorth, mechanics);
}

export function wealthAdvantageBonus(netWorth: number, mechanics: GameMechanics): number {
  const safeNetWorth = Math.max(0, finiteOrZero(netWorth));

  return mechanics.prestige.wealthAdvantageCoefficient *
    (safeNetWorth / mechanics.prestige.wealthAdvantageBase) **
      mechanics.prestige.wealthAdvantageExponent;
}

export function wealthAdvantageMultiplierForHustle(
  netWorth: number,
  definition: HustleMechanicsDefinition,
  mechanics: GameMechanics
): number {
  return 1 + wealthAdvantageBonusForHustle(netWorth, definition, mechanics);
}

export function wealthAdvantageBonusForHustle(
  netWorth: number,
  definition: HustleMechanicsDefinition,
  mechanics: GameMechanics
): number {
  const fullBonus = wealthAdvantageBonus(netWorth, mechanics);

  if (fullBonus <= 0 || definition.unlockNetWorth <= 0) {
    return fullBonus;
  }

  const currentStratumIndex = stratumIndexForNetWorth(netWorth, mechanics);
  const hustleStratumIndex = stratumIndexForNetWorth(definition.unlockNetWorth, mechanics);
  const distance = currentStratumIndex - hustleStratumIndex;
  const factor = distance <= 0
    ? mechanics.prestige.frontierWealthFactor
    : distance === 1
      ? mechanics.prestige.priorStratumWealthFactor
      : 1;

  return fullBonus * factor;
}

export function collectActiveModifiers(
  state: GriftOsGameState,
  mechanics: GameMechanics
): MechanicalModifierDefinition[] {
  const milestoneModifiers = mechanics.flatMap((definition) => {
    const hustle = state.hustles[definition.id];

    return definition.milestones
      .filter((milestone) => hustle.reachedMilestones.includes(milestone.id))
      .map((milestone) => milestone.reward);
  });
  const leverageModifiers = mechanics.leverage
    .filter((definition) => state.leveragePurchases.includes(definition.id))
    .flatMap((definition) => definition.modifiers);
  const extractionRetention = extractionOutputRetention(state, mechanics);
  const extractionModifiers: MechanicalModifierDefinition[] = extractionRetention < 1
    ? [{
        id: 'extraction-output-diversion',
        scope: 'temporary',
        kind: 'output',
        value: extractionRetention - 1,
        source: 'system',
      }]
    : [];

  return [
    ...milestoneModifiers,
    ...leverageModifiers,
    ...extractionModifiers,
    ...mechanics.map((definition) => createMetaOutputModifier(state.netWorth, definition, mechanics)),
  ].filter((modifier) => Number.isFinite(modifier.value) && modifier.value !== 0);
}

export function modifierBreakdownForHustle(
  state: GriftOsGameState,
  mechanics: GameMechanics,
  hustleId: HustleId
): ModifierBreakdown {
  const modifiers = collectActiveModifiers(state, mechanics)
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
  modifiers: readonly MechanicalModifierDefinition[],
  kind: ModifierKind
): ModifierBuckets {
  const buckets = { ...EMPTY_BUCKETS };

  for (const modifier of modifiers.filter((candidate) => candidate.kind === kind)) {
    const key = scopeToBucket(modifier.scope);
    buckets[key] += modifier.value;
  }

  return buckets;
}

function appliesToHustle(modifier: MechanicalModifierDefinition, hustleId: HustleId): boolean {
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

function stratumIndexForNetWorth(netWorth: number, mechanics: GameMechanics): number {
  const safeNetWorth = Math.max(0, finiteOrZero(netWorth));

  for (let index = mechanics.campaignStrata.length - 1; index >= 0; index -= 1) {
    if (safeNetWorth >= mechanics.campaignStrata[index].minimumNetWorth) {
      return index;
    }
  }

  return 0;
}
