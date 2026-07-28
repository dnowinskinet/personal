/**
 * The bridge from the facility to the existing product payoff.
 *
 * The directive asks for "the smallest clean adapter", and the reason to keep it small is that the
 * assemble-from-what-you-actually-made payoff is the part of the prototype worth preserving. So
 * this module translates; it does not decide. Nothing here changes what a quarter is worth.
 *
 * Direction is one-way. `sim/facility` knows nothing about chassis, boards or tiers — it emits
 * opaque output tags — and `sim/quarter` knows nothing about rooms or staff. Only this file knows
 * both, which is what makes either side replaceable.
 */

import type { FacilityOutput } from '../facility/index';
import { PART_KINDS, TIERS, emptyStock, type PartKind, type PartStock, type Tier } from '../quarter/types';

/** Quality at or above which a completed part counts as the given tier. */
export interface TierThresholds {
  readonly tier2: number;
  readonly tier3: number;
}

/**
 * Calibrated against the range the simulation can actually reach, not against a guess.
 *
 * `workQuality` spans about 0.72 (a junior with poor precision) to 1.35 (a principal with excellent
 * precision), and room fit-out scales that by at most 1.25. So tier 2 asks for a good worker or a
 * well-equipped room, and tier 3 asks for both — which is the progression the existing ladder
 * already assumes without needing the ladder to change.
 */
export const DEFAULT_TIER_THRESHOLDS: TierThresholds = { tier2: 1.06, tier3: 1.3 };

export function tierForQuality(quality: number, thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS): Tier {
  if (quality >= thresholds.tier3) {
    return 3;
  }
  return quality >= thresholds.tier2 ? 2 : 1;
}

function isPartKind(tag: string | null): tag is PartKind {
  return tag !== null && (PART_KINDS as readonly string[]).includes(tag);
}

/**
 * Folds completed facility work into the quarter's part stock.
 *
 * Untagged output — QA passes, and anything a future station emits that the product loop has no
 * use for — is counted separately rather than silently dropped, so a workshop full of stations
 * producing nothing the payoff wants is visible instead of mysterious.
 */
export interface StockConversion {
  readonly stock: PartStock;
  /** Research points earned, unconverted. The caller decides what a level costs. */
  readonly researchPoints: number;
  /** Completed work with no product use, by tag or job kind. */
  readonly unused: Readonly<Record<string, number>>;
}

export function toPartStock(
  output: FacilityOutput,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS
): StockConversion {
  const counts: Record<string, Record<number, number>> = {};
  for (const kind of PART_KINDS) {
    counts[kind] = { 1: 0, 2: 0, 3: 0 };
  }
  const unused: Record<string, number> = {};

  for (const part of output.parts) {
    if (isPartKind(part.tag)) {
      counts[part.tag][tierForQuality(part.quality, thresholds)] += 1;
    } else {
      const label = part.tag ?? part.kind;
      unused[label] = (unused[label] ?? 0) + 1;
    }
  }

  const stock = emptyStock();
  const filled: Record<string, Readonly<Record<Tier, number>>> = {};
  for (const kind of PART_KINDS) {
    filled[kind] = { 1: counts[kind][1], 2: counts[kind][2], 3: counts[kind][3] };
  }

  return {
    stock: { ...stock, ...filled } as PartStock,
    researchPoints: output.researchPoints,
    unused,
  };
}

/** Research level the facility's research work has bought, on the quarter's own scale. */
export function researchLevelFrom(researchPoints: number, pointsPerLevel: number): number {
  if (pointsPerLevel <= 0) {
    return 0;
  }
  return Math.floor(researchPoints / pointsPerLevel);
}

/**
 * Why the assembly menu looks the way it does, in the facility's terms.
 *
 * The payoff is only meaningful if a thin menu is traceable back to a room decision, so this names
 * the missing part and the tier it is short of rather than reporting a bare count.
 */
export interface ShortfallLine {
  readonly kind: PartKind;
  readonly held: number;
  readonly bestTier: Tier | null;
  readonly text: string;
}

export function explainStock(stock: PartStock, kinds: readonly PartKind[] = PART_KINDS): readonly ShortfallLine[] {
  return kinds.map((kind) => {
    const byTier = stock[kind];
    const held = TIERS.reduce((total, tier) => total + byTier[tier], 0);
    const bestTier = [...TIERS].reverse().find((tier) => byTier[tier] > 0) ?? null;
    const text =
      held === 0
        ? `No ${kind} was produced. A workshop needs a station that makes ${kind}, staffed by a qualified operator.`
        : `${held} × ${kind} on hand, best tier ${bestTier ?? 1}.`;
    return { kind, held, bestTier, text };
  });
}
