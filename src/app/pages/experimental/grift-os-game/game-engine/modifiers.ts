import {
  GriftOsGameState,
  HustleDefinition,
  HustleId,
  ModifierDefinition,
  ModifierKind,
  ModifierScope,
} from './types';

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

export function createMetaOutputModifier(netWorth: number): ModifierDefinition {
  return {
    id: 'net-worth-wealth-advantage',
    label: 'Wealth Advantage',
    description: 'Permanent Net Worth makes all Hustles more persuasive.',
    scope: 'meta',
    kind: 'output',
    value: wealthAdvantageBonus(netWorth),
    source: 'rug-pull',
  };
}

export function wealthAdvantageMultiplier(netWorth: number): number {
  return 1 + wealthAdvantageBonus(netWorth);
}

export function wealthAdvantageBonus(netWorth: number): number {
  const safeNetWorth = Math.max(0, finiteOrZero(netWorth));

  return 0.2 * Math.log10(1 + safeNetWorth / 100_000);
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

  return [
    ...milestoneModifiers,
    createMetaOutputModifier(state.netWorth),
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
