/**
 * Turning decisions into sellable offers.
 *
 * Every trait an offer has is derived here from platform architecture, component tier and the
 * carried-over flag. Nothing is authored directly on an offer, which is what makes the
 * five headline decisions genuinely propagate rather than decorate.
 */

import type {
  ClaimPosture,
  ComponentTier,
  ContentPack,
  Offer,
  OfferDecisions,
  PlatformDecisions,
  QuarterDecisions,
  Trait,
  TraitScores,
  VariantDefinition,
} from './types';

const TRAITS: readonly Trait[] = [
  'prestige',
  'repairability',
  'capability',
  'compatibility',
  'reliability',
  'longevity',
];

/**
 * Battery architecture. The canonical worked example: one decision reaching thickness, repair,
 * reliability and longevity at once.
 *
 * Sealed buys prestige at the cost of everything that shows up later. That asymmetry is the point —
 * it should be genuinely tempting, not obviously wrong.
 */
const BATTERY_EFFECTS: Readonly<Record<PlatformDecisions['battery'], Partial<TraitScores>>> = {
  sealed: { prestige: 14, repairability: -22, longevity: -10, reliability: -3 },
  // A serviceable pack needs a housing and a seam, which costs internal volume — so it also costs
  // camera and thermal headroom. Without this, modular has no downside anyone actually feels and
  // the durable posture dominates every segment that ignores prestige.
  modular: { prestige: -8, capability: -18, repairability: 20, longevity: 12, reliability: 2 },
};

/**
 * Unit-cost multiplier by battery architecture.
 *
 * A serviceable pack costs more to build — housing, connectors, fasteners. Durability is not free,
 * and without this the durable posture had no economic cost at all.
 */
const BATTERY_COST: Readonly<Record<PlatformDecisions['battery'], number>> = {
  sealed: 1,
  modular: 1.09,
};

/** Connector stance. Proprietary breaks continuity with the carried-over generation's accessories. */
const CONNECTOR_EFFECTS: Readonly<Record<PlatformDecisions['connector'], Partial<TraitScores>>> = {
  universal: { compatibility: 16, prestige: -3 },
  proprietary: { compatibility: -20, prestige: 5 },
};

/** Supplier. Aggressive is cheaper per unit but pays for it in reliability and defect risk. */
const SUPPLIER_EFFECTS: Readonly<Record<PlatformDecisions['supplier'], Partial<TraitScores>>> = {
  incumbent: { reliability: 8 },
  aggressive: { reliability: -10 },
};

/**
 * Unit-cost multiplier by supplier. The reason to take the aggressive one at all.
 *
 * The gap has to be wide enough that the scale-first posture can actually win the portfolio
 * dimension. At a narrower gap it lost every dimension to one of the other two and had no reason
 * to exist — dependability was simply free.
 */
const SUPPLIER_COST: Readonly<Record<PlatformDecisions['supplier'], number>> = {
  incumbent: 1.08,
  aggressive: 0.66,
};

export function supplierCostMultiplier(supplier: PlatformDecisions['supplier']): number {
  return SUPPLIER_COST[supplier];
}

const TIER_EFFECTS: Readonly<Record<ComponentTier, Partial<TraitScores>>> = {
  basic: { capability: -14, prestige: -8 },
  standard: {},
  premium: { capability: 16, prestige: 10 },
};

/** Cost multiplier applied to unit cost by component tier. */
const TIER_COST: Readonly<Record<ComponentTier, number>> = {
  basic: 0.82,
  standard: 1,
  premium: 1.34,
};

/** Engineering multiplier by tier. Premium parts cost design time, not just money. */
const TIER_ENGINEERING: Readonly<Record<ComponentTier, number>> = {
  basic: 0.85,
  standard: 1,
  premium: 1.4,
};

/** How far each claim posture outruns reality. Feeds the trust dimension. */
const CLAIM_GAP: Readonly<Record<ClaimPosture, number>> = {
  conservative: -4,
  confident: 3,
  aggressive: 14,
};

/** Reach bonus from claiming harder. The temptation that makes claim posture a real decision. */
const CLAIM_REACH: Readonly<Record<ClaimPosture, number>> = {
  conservative: -14,
  confident: 2,
  aggressive: 22,
};

export function claimReachBonus(claim: ClaimPosture): number {
  return CLAIM_REACH[claim];
}

export function tierCostMultiplier(tier: ComponentTier): number {
  return TIER_COST[tier];
}

export function tierEngineeringMultiplier(tier: ComponentTier): number {
  return TIER_ENGINEERING[tier];
}

function addTraits(base: TraitScores, delta: Partial<TraitScores>): TraitScores {
  const result: Record<Trait, number> = { ...base };
  for (const trait of TRAITS) {
    const change = delta[trait];
    if (change !== undefined) {
      result[trait] = result[trait] + change;
    }
  }
  return result;
}

/**
 * Support-promise years raise longevity appeal, with diminishing returns past a point — a ten-year
 * promise is not twice as attractive as a five-year one, but it does cost twice as much to honour.
 */
function supportTraitBonus(years: number): number {
  return Math.round(Math.min(years, 8) * 2.6);
}

/**
 * Builds one offer from a variant definition and the decisions applied to it.
 *
 * A carried-over offer keeps its previous generation's connector, so a proprietary switch damages
 * its compatibility harder than it damages a fresh design's.
 */
export function buildOffer(
  variant: VariantDefinition,
  decisions: OfferDecisions,
  platform: PlatformDecisions
): Offer {
  let traits = variant.baseTraits;
  traits = addTraits(traits, BATTERY_EFFECTS[platform.battery]);
  traits = addTraits(traits, CONNECTOR_EFFECTS[platform.connector]);
  traits = addTraits(traits, SUPPLIER_EFFECTS[platform.supplier]);
  traits = addTraits(traits, TIER_EFFECTS[decisions.tier]);
  traits = addTraits(traits, { longevity: supportTraitBonus(decisions.supportYears) });

  if (variant.carriedOver && platform.connector === 'proprietary') {
    // The carried-over generation's accessories no longer fit the new standard.
    traits = addTraits(traits, { compatibility: -14 });
  }

  if (variant.carriedOver) {
    // Last year's design cannot lead on prestige no matter what is done to it.
    traits = addTraits(traits, { prestige: -12 });
  }

  return {
    variantId: variant.id,
    name: variant.name,
    slot: variant.slot,
    carriedOver: variant.carriedOver,
    price: decisions.price,
    traits,
    unitCost:
      variant.unitCost *
      TIER_COST[decisions.tier] *
      SUPPLIER_COST[platform.supplier] *
      BATTERY_COST[platform.battery],
    supportYears: decisions.supportYears,
    claim: decisions.claim,
    claimGap: CLAIM_GAP[decisions.claim],
  };
}

/** Every offer the player has chosen to ship, in slot order. */
export function buildLineup(pack: ContentPack, decisions: QuarterDecisions): readonly Offer[] {
  const offers: Offer[] = [];
  for (const variant of pack.variants) {
    const offerDecisions = decisions.offers[variant.id];
    if (offerDecisions === undefined || !offerDecisions.included) {
      continue;
    }
    offers.push(buildOffer(variant, offerDecisions, decisions.platform));
  }
  return offers;
}
