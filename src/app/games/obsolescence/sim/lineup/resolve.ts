/**
 * Quarter resolution.
 *
 * Produces R5's five dimensions, which are permitted — expected — to disagree with each other.
 * **There is no overall grade.** A quarter can be commercially excellent and lifecycle-dangerous,
 * clear but understocked, or weak at launch and recoverable through support.
 *
 * Every number here is deterministic given the seed and the decisions (I-004).
 */

import { randomAt } from '../rng';
import { computeCapacity, launchInventory, serviceReserve, testCoverage } from './capacity';
import { claimReachBonus, buildLineup } from './offers';
import { attachRate, resolveSegment } from './demand';
import type { ContentPack, Offer, QuarterDecisions, QuarterOutcome, SegmentOutcome } from './types';

/** Total addressable demand index when every segment converts fully. */
const TOTAL_DEMAND_INDEX = 1000;

/** Cost of honouring one year of support promise on one unit sold. */
const SUPPORT_COST_PER_UNIT_YEAR = 11;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * Probability that the battery defect materialises this quarter.
 *
 * Sealed packs under an aggressive supplier with thin test coverage is the dangerous corner. Paying
 * test capacity to investigate the late signal reduces it — which is exactly the capacity the player
 * wanted for validating a third offer.
 */
function defectProbability(decisions: QuarterDecisions, coverage: number): number {
  let risk = 0.1;
  if (decisions.platform.battery === 'sealed') {
    risk += 0.16;
  }
  if (decisions.platform.supplier === 'aggressive') {
    risk += 0.22;
  }
  risk += (1 - coverage) * 0.3;
  risk -= Math.min(decisions.batteryInvestigation, 20) * 0.011;
  return Math.max(0.02, Math.min(0.85, risk));
}

export function resolveQuarter(
  pack: ContentPack,
  decisions: QuarterDecisions,
  seed: number
): QuarterOutcome {
  const offers = buildLineup(pack, decisions);
  const usage = computeCapacity(pack, decisions);
  const coverage = testCoverage(usage);
  const inventory = launchInventory(pack, decisions);
  const reserve = serviceReserve(pack, decisions);
  const notes: string[] = [];

  // --- demand -------------------------------------------------------------
  const segmentOutcomes: SegmentOutcome[] = pack.segments.map((segment, index) =>
    resolveSegment(segment, offers, seed, index + 1)
  );

  const claimLift = offers.length > 0 ? mean(offers.map((offer) => claimReachBonus(offer.claim))) : 0;
  const rawDemand = segmentOutcomes.reduce((total, outcome) => total + outcome.unitsIndex, 0);
  const liftedDemand = Math.max(0, Math.round(rawDemand * (1 + claimLift / 100)));

  // --- stock --------------------------------------------------------------
  const unitsSold = Math.min(liftedDemand, inventory);
  const stockouts = Math.max(0, liftedDemand - inventory);
  const overhang = Math.max(0, inventory - liftedDemand);

  if (stockouts > 0) {
    notes.push(`${stockouts} units of demand went unmet — launch inventory ran out.`);
  }
  if (overhang > inventory * 0.4 && inventory > 0) {
    notes.push(`${overhang} units left unsold. Capital is sitting in a warehouse.`);
  }

  // --- defect -------------------------------------------------------------
  const probability = defectProbability(decisions, coverage);
  const roll = randomAt(seed, 900);
  const defectOccurred = roll < probability;
  const defectSeverity = defectOccurred ? Math.round(40 + randomAt(seed, 901) * 45) : 0;

  if (defectOccurred) {
    notes.push(
      `The battery signal was real. Severity ${defectSeverity}. ${
        decisions.batteryInvestigation > 0
          ? 'The investigation reduced the odds but did not eliminate them.'
          : 'It was never investigated.'
      }`
    );
  }

  // Reserve adequacy: a defect consumes service stock. Holding none is fine right up until it isn't.
  const reserveNeeded = defectOccurred ? Math.round(unitsSold * (defectSeverity / 220)) : 0;
  const reserveShortfall = Math.max(0, reserveNeeded - reserve);
  if (reserveShortfall > 0) {
    notes.push(`Service reserve short by ${reserveShortfall} units. Exchanges could not be honoured.`);
  }

  // --- economics ----------------------------------------------------------
  const soldShare = liftedDemand > 0 ? unitsSold / liftedDemand : 0;
  const ecosystem = offers.find((offer) => offer.slot === 'ecosystem') ?? null;
  let revenue = 0;
  let cost = 0;
  let attachedUnits = 0;

  for (const outcome of segmentOutcomes) {
    if (outcome.chosenVariantId === null) {
      continue;
    }
    const offer = offers.find((candidate) => candidate.variantId === outcome.chosenVariantId);
    if (offer === undefined) {
      continue;
    }
    const units = outcome.unitsIndex * soldShare;
    revenue += units * offer.price;
    cost += units * offer.unitCost;

    // Honouring a support promise costs per unit sold, per year promised. A flat per-offer charge
    // made long support essentially free, so the durable posture bought loyalty with no economic
    // consequence and out-earned everyone while also out-lasting them.
    cost += units * offer.supportYears * SUPPORT_COST_PER_UNIT_YEAR;

    // The ecosystem slot attaches to a device sale rather than competing with it.
    if (ecosystem !== null) {
      const attached = units * attachRate(ecosystem, offer);
      attachedUnits += attached;
      revenue += attached * ecosystem.price;
      cost += attached * ecosystem.unitCost;
    }
  }

  if (ecosystem !== null && unitsSold > 0) {
    const rate = attachedUnits / unitsSold;
    notes.push(`${ecosystem.name} attached to ${Math.round(rate * 100)}% of device sales.`);
  }
  // Unsold inventory still cost money to build.
  cost += overhang * meanUnitCost(offers);
  // Service reserve is capital sitting in a room. Holding it is a real cost, not free insurance.
  cost += reserve * meanUnitCost(offers) * 0.55;
  // Standing up a support organisation at all, before any units are sold into it.
  cost += offers.reduce((total, offer) => total + offer.supportYears * 340, 0);

  const profit = revenue - cost;

  // --- the five dimensions ------------------------------------------------
  // Scaled so a posture that sells out its whole stock pool lands near the top of the range without
  // clipping. Saturating at 100 hid the difference between "sold well" and "sold everything".
  const reach = clamp((unitsSold / TOTAL_DEMAND_INDEX) * 150);

  const margin = revenue > 0 ? profit / revenue : -1;
  const stockEfficiency = inventory > 0 ? unitsSold / inventory : 0;
  // Margin carries most of the weight. Scaled so realistic margins land mid-range — an earlier
  // version saturated at 100 for every posture, and a later one leaned so hard on stock efficiency
  // that a low-cost, thin-reserve posture was punished for the overhang its own cheapness created,
  // leaving it with no dimension to win at all.
  const portfolio = clamp(8 + margin * 112 + stockEfficiency * 11 - stockouts / 26);

  const confusedCount = segmentOutcomes.filter((outcome) => outcome.confused).length;
  const winners = new Set(
    segmentOutcomes.map((outcome) => outcome.chosenVariantId).filter((id): id is string => id !== null)
  );
  // An ecosystem offer is never "nobody's first choice" — it is nobody's first choice by design.
  const deadOffers = offers.filter(
    (offer) => offer.slot !== 'ecosystem' && !winners.has(offer.variantId)
  ).length;
  const clarity = clamp(92 - confusedCount * 21 - deadOffers * 16);
  if (deadOffers > 0) {
    notes.push(`${deadOffers} offer(s) were nobody's first choice. They took capacity and won nothing.`);
  }

  const meanClaimGap = offers.length > 0 ? mean(offers.map((offer) => offer.claimGap)) : 0;
  const meanCompatibility = offers.length > 0 ? mean(offers.map((offer) => offer.traits.compatibility)) : 0;
  const meanReliability = offers.length > 0 ? mean(offers.map((offer) => offer.traits.reliability)) : 0;

  // Reliability belongs in both of these. Without it the supplier choice only moved reach and
  // portfolio, and read as a fake decision on the two dimensions it should affect most: a less
  // dependable product is exactly what erodes belief and generates returns.
  // Service readiness is visible before anything breaks — walk-in exchanges, no waiting for stock.
  // Without this the reserve split only mattered in the minority of quarters where a defect fired,
  // which made it read as a fake decision most of the time.
  const readiness = Math.min(decisions.reserveSplit, 0.45);

  const trust = clamp(
    54 +
      meanCompatibility / 2.4 +
      (meanReliability - 35) / 4 +
      readiness * 26 -
      meanClaimGap * 1.7 -
      (defectOccurred ? defectSeverity / 2.1 : 0) -
      reserveShortfall / 9
  );

  const meanRepairability = offers.length > 0 ? mean(offers.map((offer) => offer.traits.repairability)) : 0;
  const meanLongevity = offers.length > 0 ? mean(offers.map((offer) => offer.traits.longevity)) : 0;
  const ownership = clamp(
    40 +
      meanRepairability / 2.2 +
      meanLongevity / 2.6 +
      (meanReliability - 35) / 4 +
      readiness * 34 -
      (defectOccurred ? defectSeverity / 1.9 : 0) -
      reserveShortfall / 7
  );

  if (usage.overCommitted) {
    notes.push('The lineup was over-committed. Under-validated work shipped anyway.');
  }

  return {
    reach: Math.round(reach),
    portfolio: Math.round(portfolio),
    clarity: Math.round(clarity),
    trust: Math.round(trust),
    ownership: Math.round(ownership),
    revenue: Math.round(revenue),
    cost: Math.round(cost),
    unitsSold: Math.round(unitsSold),
    defectOccurred,
    defectSeverity,
    stockouts: Math.round(stockouts),
    overhang: Math.round(overhang),
    segments: segmentOutcomes,
    offers,
    notes,
  };
}

function meanUnitCost(offers: readonly Offer[]): number {
  if (offers.length === 0) {
    return 0;
  }
  return mean(offers.map((offer) => offer.unitCost));
}
