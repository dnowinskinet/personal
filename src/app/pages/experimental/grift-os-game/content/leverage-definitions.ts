import { LeverageDefinition } from '../game-engine/types';

export const LEVERAGE_DEFINITIONS: readonly LeverageDefinition[] = [
  {
    id: 'attention-loop',
    domain: 'attention',
    name: 'Cross-Promotion Compact',
    description: 'Make every creator surface distribute every product without paying the market rate for reach.',
    cost: 25_000_000,
    unlockNetWorth: 0,
    requiredOwnedHustles: ['masterclass-business'],
    requiredAutomatedHustles: ['troll-network', 'podcast-network', 'culture-war-media'],
    modifiers: [
      leverageModifier('attention-loop-output', 'Creator portfolio output x2', 'output', 1, [
        'troll-network',
        'podcast-network',
        'culture-war-media',
        'masterclass-business',
        'manifesto-imprint',
      ]),
    ],
  },
  {
    id: 'closed-circuit-doctrine',
    domain: 'doctrine',
    name: 'Direct Audience Ledger',
    description: 'Connect subscriptions, purchases, appearances, and membership rank to one owned customer record.',
    cost: 750_000_000,
    unlockNetWorth: 1_000_000,
    requiredOwnedHustles: ['founder-retreat-circuit'],
    requiredAutomatedHustles: ['podcast-network', 'manifesto-imprint', 'founder-retreat-circuit'],
    modifiers: [
      leverageModifier('closed-circuit-doctrine-output', 'Direct-audience portfolio output x2', 'output', 1, [
        'podcast-network',
        'culture-war-media',
        'masterclass-business',
        'manifesto-imprint',
        'founder-retreat-circuit',
      ]),
      leverageModifier('closed-circuit-doctrine-cost', 'All expansion costs divided by 1.5', 'cost', 0.5),
    ],
  },
  {
    id: 'capital-access',
    domain: 'capital',
    name: 'Crisis Conversion Desk',
    description: 'Route membership loyalty, recurring emergencies, and token demand through the same conversion machine.',
    cost: 25_000_000_000,
    unlockNetWorth: 30_000_000,
    requiredOwnedHustles: ['venture-portfolio'],
    requiredAutomatedHustles: ['founder-retreat-circuit', 'ai-venture'],
    modifiers: [
      leverageModifier('capital-access-output', 'Belief-conversion portfolio output x2', 'output', 1, [
        'founder-retreat-circuit',
        'ai-venture',
        'venture-portfolio',
      ]),
      leverageModifier('capital-access-automation', 'All automation costs divided by 2', 'automation-cost', 1),
    ],
  },
  {
    id: 'institutional-capture',
    domain: 'capital',
    name: 'Network Ad Exchange',
    description: 'Package shows, personalities, and platform inventory inside one market for sponsor demand.',
    cost: 750_000_000_000,
    unlockNetWorth: 1_000_000_000,
    requiredOwnedHustles: ['venture-portfolio'],
    requiredAutomatedHustles: ['ai-venture', 'venture-portfolio'],
    modifiers: [
      leverageModifier('institutional-capture-output', 'Network inventory output x2', 'output', 1, [
        'masterclass-business',
        'venture-portfolio',
        'media-holdings',
        'sovereign-network',
      ]),
      leverageModifier('institutional-capture-speed', 'Network Hustles cycle 1.5x faster', 'cadence', 0.5, [
        'masterclass-business',
        'media-holdings',
        'sovereign-network',
      ]),
    ],
  },
  {
    id: 'sovereign-stack',
    domain: 'sovereignty',
    name: 'Controlling Interest',
    description: 'Own enough of the network and platform that distribution policy becomes a balance-sheet decision.',
    cost: 25_000_000_000_000,
    unlockNetWorth: 30_000_000_000,
    requiredOwnedHustles: ['sovereign-network'],
    requiredAutomatedHustles: ['media-holdings'],
    modifiers: [
      leverageModifier('sovereign-stack-output', 'Owned attention-market output x3', 'output', 2, [
        'media-holdings',
        'sovereign-network',
      ]),
      leverageModifier('sovereign-stack-cost', 'All expansion costs divided by 1.5', 'cost', 0.5),
    ],
  },
] as const;

function leverageModifier(
  id: string,
  label: string,
  kind: LeverageDefinition['modifiers'][number]['kind'],
  value: number,
  hustleIds?: LeverageDefinition['requiredOwnedHustles']
): LeverageDefinition['modifiers'][number] {
  return {
    id,
    label,
    scope: hustleIds ? 'synergy' : 'global',
    kind,
    value,
    hustleIds,
    source: 'leverage',
  };
}
