/**
 * The three strategic doctrines, expressed as complete quarter decisions.
 *
 * These are the policy bots the dominance sweep runs (D-003). They are not player-facing classes —
 * R6 and R7 both insist the paths must be differently *burdened*, not differently virtuous, and
 * must emerge from shared systems rather than from a faction button.
 *
 * If any one of these wins reach AND trust AND ownership simultaneously across most seeds, the
 * tradeoffs are decorative and Gate A has failed.
 */

import type { QuarterDecisions } from '../sim/index';

export type DoctrineName = 'durable' | 'premium' | 'scale';

export interface Doctrine {
  readonly name: DoctrineName;
  readonly label: string;
  readonly summary: string;
  readonly decisions: QuarterDecisions;
}

/** Durable / open / service-heavy. Slower growth, stronger ownership, weaker launch sparkle. */
const DURABLE: QuarterDecisions = {
  platform: { battery: 'modular', connector: 'universal', supplier: 'incumbent' },
  offers: {
    'lark-m1-lite': { included: true, price: 379, tier: 'basic', supportYears: 5, claim: 'conservative' },
    'lark-m2-standard': { included: true, price: 679, tier: 'standard', supportYears: 6, claim: 'conservative' },
    'lark-m2-pro': { included: false, price: 1049, tier: 'premium', supportYears: 6, claim: 'confident' },
    dockpass: { included: true, price: 129, tier: 'standard', supportYears: 5, claim: 'conservative' },
  },
  reserveSplit: 0.26,
  batteryInvestigation: 6,
};

/** Premium / integrated / ecosystem-heavy. Strong margin and prestige, fragile on support. */
const PREMIUM: QuarterDecisions = {
  platform: { battery: 'sealed', connector: 'proprietary', supplier: 'incumbent' },
  offers: {
    'lark-m1-lite': { included: false, price: 399, tier: 'basic', supportYears: 3, claim: 'confident' },
    'lark-m2-standard': { included: true, price: 799, tier: 'standard', supportYears: 3, claim: 'confident' },
    // Standard tier, not premium: a premium-tier Pro alongside the Standard blows the engineering
    // ceiling, and a policy bot used as a balance baseline must be a legal configuration rather
    // than a permanently over-committed one.
    'lark-m2-pro': { included: true, price: 1199, tier: 'standard', supportYears: 4, claim: 'aggressive' },
    dockpass: { included: false, price: 189, tier: 'premium', supportYears: 3, claim: 'confident' },
  },
  reserveSplit: 0.12,
  batteryInvestigation: 0,
};

/**
 * Scale-first / volume. Widest reach, thinnest shock absorption.
 *
 * Note the halo: a Pro at *basic* component tier still clears the prestige bar on a sealed
 * chassis, and costs far less engineering than a premium-tier one. That is the scale-first move —
 * cover every slot cheaply rather than do any of them properly. It is also why this posture ships
 * three devices on a budget that only lets the others ship two.
 */
const SCALE: QuarterDecisions = {
  platform: { battery: 'sealed', connector: 'universal', supplier: 'aggressive' },
  offers: {
    'lark-m1-lite': { included: true, price: 299, tier: 'basic', supportYears: 2, claim: 'aggressive' },
    'lark-m2-standard': { included: true, price: 549, tier: 'standard', supportYears: 2, claim: 'aggressive' },
    'lark-m2-pro': { included: true, price: 849, tier: 'basic', supportYears: 2, claim: 'aggressive' },
    dockpass: { included: false, price: 89, tier: 'basic', supportYears: 2, claim: 'confident' },
  },
  reserveSplit: 0.08,
  batteryInvestigation: 0,
};

export const DOCTRINES: readonly Doctrine[] = [
  {
    name: 'durable',
    label: 'Durable / open',
    summary: 'Modular battery, universal connector, long support. Slower reach, stronger ownership.',
    decisions: DURABLE,
  },
  {
    name: 'premium',
    label: 'Premium / integrated',
    summary: 'Sealed battery, proprietary connector, high margin. Fragile when anything goes wrong.',
    decisions: PREMIUM,
  },
  {
    name: 'scale',
    label: 'Scale-first',
    summary: 'Cheapest supplier mix, thin reserves, widest reach, weakest shock absorption.',
    decisions: SCALE,
  },
];

/** The player's starting position — deliberately unremarkable, so every move is theirs. */
export const DEFAULT_DECISIONS: QuarterDecisions = {
  platform: { battery: 'modular', connector: 'universal', supplier: 'incumbent' },
  offers: {
    'lark-m1-lite': { included: true, price: 329, tier: 'basic', supportYears: 3, claim: 'confident' },
    'lark-m2-standard': { included: true, price: 699, tier: 'standard', supportYears: 4, claim: 'confident' },
    'lark-m2-pro': { included: false, price: 1049, tier: 'premium', supportYears: 4, claim: 'confident' },
    dockpass: { included: false, price: 149, tier: 'standard', supportYears: 3, claim: 'confident' },
  },
  reserveSplit: 0.18,
  batteryInvestigation: 0,
};
