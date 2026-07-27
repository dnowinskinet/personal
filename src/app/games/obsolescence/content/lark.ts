/**
 * The LARK handheld fixture — Gate A's canonical scenario.
 *
 * From R9, reconciled onto R5's canonical market fixture per C-38. The central tension is a sealed
 * high-density battery versus a serviceable modular pack, with a late ambiguous thermal signal.
 *
 * Content supplies instances; `sim/` owns the schema. This file imports types from the simulation
 * and never the other way round (I-003).
 */

import type { ContentPack, SegmentDefinition, VariantDefinition } from '../sim/index';

/**
 * Four of the seven segments ship in Gate A (G-05).
 *
 * Chosen so the three doctrines the dominance sweep must distinguish each have a home:
 * Value Planners and Mainstream Upgraders carry volume (scale-first), Prestige Seekers carry margin
 * (premium/integrated), Long-Horizon Owners carry durability (durable/service-heavy).
 *
 * Capability Enthusiasts, Control and Privacy Guardians, and Institutional Operators wait. The last
 * needs contracts, which is Gate B at the earliest.
 *
 * Every segment carries at least one active dislike — R2 and R5 both require it, and it is what
 * stops the model rewarding "more quality" and collapsing into a single dominant product.
 */
export const LARK_SEGMENTS: readonly SegmentDefinition[] = [
  {
    id: 'value-planners',
    name: 'Value Planners',
    populationWeight: 0.26,
    salientNeeds: { reliability: 0.38, longevity: 0.28, capability: 0.18 },
    mustHave: {},
    priceCeiling: 620,
    priceSensitivity: 1.5,
    purchaseThreshold: 4,
    dislikes: ['fragile prestige features', 'paying for capability they will not use'],
  },
  {
    id: 'mainstream-upgraders',
    name: 'Mainstream Upgraders',
    populationWeight: 0.32,
    // Prestige is in here deliberately. Without it, nothing this segment values is damaged by a
    // modular battery, and the durable posture sweeps 84% of the population unopposed.
    salientNeeds: { capability: 0.28, compatibility: 0.24, reliability: 0.22, prestige: 0.26 },
    mustHave: {},
    priceCeiling: 900,
    priceSensitivity: 0.85,
    purchaseThreshold: 8,
    dislikes: ['a confusing lineup', 'losing accessories they already own'],
  },
  {
    id: 'prestige-seekers',
    name: 'Prestige Seekers',
    populationWeight: 0.28,
    salientNeeds: { prestige: 0.62, capability: 0.3 },
    // Will not accept a visibly compromised device at any price. Set high enough that only a
    // premium-tier device clears it — a bland Standard model must not satisfy them, whatever
    // architecture it uses.
    mustHave: { prestige: 45 },
    priceCeiling: 1500,
    priceSensitivity: 0.22,
    purchaseThreshold: 12,
    dislikes: ['visible compromise', 'last year’s design'],
  },
  {
    id: 'long-horizon-owners',
    name: 'Long-Horizon Owners',
    populationWeight: 0.14,
    salientNeeds: { repairability: 0.45, longevity: 0.4 },
    // The hard veto that makes battery architecture a real decision rather than a modifier.
    mustHave: { repairability: 18 },
    priceCeiling: 950,
    priceSensitivity: 0.7,
    purchaseThreshold: 8,
    dislikes: ['glued batteries', 'short support windows', 'expensive spares'],
  },
];

export const LARK_VARIANTS: readonly VariantDefinition[] = [
  {
    id: 'lark-m1-lite',
    name: 'LARK M1 Lite',
    slot: 'low',
    carriedOver: true,
    mandatory: false,
    baseTraits: {
      prestige: 14,
      repairability: 30,
      capability: 18,
      compatibility: 40,
      reliability: 46,
      longevity: 26,
    },
    basePrice: 399,
    engineeringCost: 6,
    unitCost: 210,
  },
  {
    id: 'lark-m2-standard',
    name: 'LARK M2 Standard',
    slot: 'standard',
    carriedOver: false,
    mandatory: true,
    baseTraits: {
      prestige: 30,
      repairability: 28,
      capability: 38,
      compatibility: 38,
      reliability: 40,
      longevity: 28,
    },
    basePrice: 699,
    engineeringCost: 34,
    unitCost: 330,
  },
  {
    id: 'lark-m2-pro',
    name: 'LARK M2 Pro',
    slot: 'premium',
    carriedOver: false,
    mandatory: false,
    baseTraits: {
      prestige: 52,
      repairability: 22,
      capability: 56,
      compatibility: 38,
      reliability: 38,
      longevity: 26,
    },
    basePrice: 1049,
    engineeringCost: 46,
    unitCost: 505,
  },
  {
    id: 'dockpass',
    name: 'DockPass',
    slot: 'ecosystem',
    carriedOver: false,
    mandatory: false,
    baseTraits: {
      prestige: 16,
      repairability: 34,
      capability: 20,
      compatibility: 52,
      reliability: 44,
      longevity: 34,
    },
    basePrice: 149,
    engineeringCost: 14,
    unitCost: 52,
  },
];

/**
 * Capacity is set so the full lineup does NOT fit comfortably.
 *
 * All four offers at standard tier need roughly 100 engineering and 27 test before any battery
 * investigation. The budget below forces a real cut: drop an offer, downgrade a tier, or ship
 * under-validated.
 */
export const LARK_PACK: ContentPack = {
  id: 'lark.q1',
  segments: LARK_SEGMENTS,
  variants: LARK_VARIANTS,
  capacity: {
    engineering: 88,
    test: 26,
    // Deliberately tight against likely demand. If stock comfortably exceeds demand, the reserve
    // split costs nothing and stops being a decision at all.
    stock: 620,
  },
};
