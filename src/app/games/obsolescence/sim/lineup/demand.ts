/**
 * The choice model.
 *
 * **This is invented.** No report in R1–R9 supplies a demand model (recorded as G-02), so the shape
 * here follows R5's stated pipeline and the numbers are a first guess that Gate A exists partly to
 * falsify.
 *
 * R5's pipeline:
 *
 *   trigger -> hard must-have veto -> consideration set -> inspection -> confidence -> friction
 *   -> purchase / substitution / delay / no purchase
 *
 * The rule that matters most is that **hard constraints veto before any soft scoring**. A segment
 * that requires a replaceable battery does not buy a beautiful sealed one at any price, and no
 * amount of camera quality compensates. That is what stops the model collapsing into "more quality
 * wins", which is R2's first kill criterion.
 */

import { randomAt } from '../rng';
import type { Offer, SegmentDefinition, SegmentOutcome, Trait } from './types';

/** Scores closer than this mean the segment could not meaningfully tell two offers apart. */
const CONFUSION_BAND = 4;

/** Conversion saturates: a great offer converts most of a segment, never all of it. */
const MAX_CONVERSION = 0.92;

/**
 * A veto decision with its reason, so the inspector can always answer "why didn't they buy it?".
 * R5 forbids unexplained outcomes; every rejection here carries a cause.
 */
interface Veto {
  readonly offer: Offer;
  readonly reason: string;
}

function traitOf(offer: Offer, trait: Trait): number {
  return offer.traits[trait];
}

/** Hard constraints. Applied before any scoring, and never overridable by quality elsewhere. */
function vetoFor(segment: SegmentDefinition, offer: Offer): string | null {
  if (offer.price > segment.priceCeiling) {
    return `${offer.name} costs ${offer.price}, above their ${segment.priceCeiling} ceiling`;
  }

  for (const [trait, minimum] of Object.entries(segment.mustHave)) {
    const value = traitOf(offer, trait as Trait);
    if (value < minimum) {
      return `${offer.name} fails their ${trait} requirement (${value} < ${minimum})`;
    }
  }

  return null;
}

/**
 * Soft score over the segment's two or three salient needs only.
 *
 * Deliberately NOT a sum over every trait. R5 is explicit that a segment weighs a couple of things
 * it cares about, not an all-purpose demand for every good statistic. Weights are expected to sum
 * to roughly 1, so this reads as a weighted average of the traits the segment actually notices.
 */
function fitScore(segment: SegmentDefinition, offer: Offer): number {
  let fit = 0;
  for (const [trait, weight] of Object.entries(segment.salientNeeds)) {
    fit += traitOf(offer, trait as Trait) * weight;
  }
  return fit;
}

/** Price hurts inside the ceiling too, scaled by how sensitive the segment is. */
function priceBurden(segment: SegmentDefinition, offer: Offer): number {
  const ratio = offer.price / segment.priceCeiling;
  return ratio * ratio * segment.priceSensitivity * 12;
}

/**
 * Confidence that the offer is what it claims to be.
 *
 * Reliability raises it; an aggressive claim lowers it. This is what makes over-claiming a genuine
 * trade rather than free reach — it buys attention and spends belief.
 *
 * Kept deliberately small relative to fit. An earlier version weighted it so heavily that
 * "pick the most reliable supplier" beat every other decision in the game.
 */
function confidence(offer: Offer): number {
  return (traitOf(offer, 'reliability') - 40) / 11 - offer.claimGap / 6;
}

/**
 * How much of a segment converts at a given score.
 *
 * The divisor sets how forgiving the curve is. An earlier version used 25, which turned a 12-point
 * score gap into a 20x sales gap — being slightly worse on a segment's salient traits meant selling
 * essentially nothing to them, and the scale-first posture became unplayable as a result. A wider
 * divisor keeps a weaker offer commercially alive while still losing.
 */
function conversionRate(score: number, threshold: number): number {
  if (score <= threshold) {
    return 0;
  }
  return Math.min(MAX_CONVERSION, (score - threshold) / 38);
}

/**
 * Resolves what one segment does.
 *
 * Returns the chosen offer, the reason, and every veto — the vetoes are the evidence the player
 * needs to understand a lineup that looked fine and sold nothing.
 */
export function resolveSegment(
  segment: SegmentDefinition,
  offers: readonly Offer[],
  seed: number,
  cursor: number
): SegmentOutcome {
  const vetoes: Veto[] = [];
  const candidates: { offer: Offer; score: number }[] = [];

  // The ecosystem slot is an ATTACH, not a rival. A customer buys a dock alongside a handheld, not
  // instead of one. Modelling it as a competitor made every segment "buy" the cheapest accessory
  // and skip the phone entirely — see gates/A-lineup-prototype.result.md.
  const devices = offers.filter((offer) => offer.slot !== 'ecosystem');

  for (const offer of devices) {
    const veto = vetoFor(segment, offer);
    if (veto !== null) {
      vetoes.push({ offer, reason: veto });
      continue;
    }
    const score = fitScore(segment, offer) - priceBurden(segment, offer) + confidence(offer);
    candidates.push({ offer, score });
  }

  candidates.sort((left, right) => right.score - left.score);

  if (candidates.length === 0) {
    return {
      segmentId: segment.id,
      chosenVariantId: null,
      reason:
        vetoes.length > 0
          ? `Nothing qualified. ${vetoes[0].reason}`
          : 'Nothing was on offer.',
      vetoed: vetoes.map((veto) => veto.reason),
      score: 0,
      unitsIndex: 0,
      confused: false,
    };
  }

  const best = candidates[0];
  const runnerUp = candidates.length > 1 ? candidates[1] : null;
  const confused = runnerUp !== null && Math.abs(best.score - runnerUp.score) < CONFUSION_BAND;

  if (best.score < segment.purchaseThreshold) {
    return {
      segmentId: segment.id,
      chosenVariantId: null,
      reason: `Nothing cleared the bar. Best was ${best.offer.name} at ${best.score.toFixed(1)}, needed ${segment.purchaseThreshold}.`,
      vetoed: vetoes.map((veto) => veto.reason),
      score: best.score,
      unitsIndex: 0,
      confused,
    };
  }

  // A small deterministic wobble breaks genuine near-ties. It can never rescue an offer that
  // failed a must-have, because vetoed offers never reach this point.
  const wobble = (randomAt(seed, cursor) - 0.5) * 2;
  const rate = conversionRate(best.score + wobble, segment.purchaseThreshold);
  const unitsIndex = segment.populationWeight * rate * 1000;

  const reason = confused
    ? `Chose ${best.offer.name}, but ${runnerUp?.offer.name} scored within ${CONFUSION_BAND} points — the lineup did not make the difference clear.`
    : `Chose ${best.offer.name} on ${describeNeeds(segment)}.`;

  return {
    segmentId: segment.id,
    chosenVariantId: best.offer.variantId,
    reason,
    vetoed: vetoes.map((veto) => veto.reason),
    score: best.score,
    unitsIndex: Math.round(unitsIndex),
    confused,
  };
}

function describeNeeds(segment: SegmentDefinition): string {
  return Object.keys(segment.salientNeeds).join(' and ');
}

/**
 * Attach rate for an ecosystem offer among customers who already bought a device.
 *
 * Driven by compatibility and by how cheap the add-on is relative to the device it clips onto. A
 * proprietary connector raises accessory margin but shrinks the compatible base — which is the
 * tension the ecosystem slot exists to create.
 */
export function attachRate(ecosystem: Offer, device: Offer): number {
  const compatibility = traitOf(ecosystem, 'compatibility') / 130;
  const relativePrice = ecosystem.price / Math.max(device.price, 1);
  const affordability = Math.max(0, 0.5 - relativePrice);
  return Math.max(0, Math.min(0.75, compatibility + affordability));
}
