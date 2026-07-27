/**
 * Shared capacity.
 *
 * This is where the lineup stops being a wish list. Engineering and test are consumed by what the
 * player includes and how well they build it; the stock pool is split between launch inventory and
 * service reserve, and both uses are legitimate.
 *
 * R1 names shared engineering time, prototype/test capacity and launch surface as the constraints
 * that create *interesting substitutions* rather than mere waiting. Nothing here makes the player
 * wait; everything here makes them choose.
 */

import { tierEngineeringMultiplier } from './offers';
import type { CapacityUsage, ContentPack, QuarterDecisions } from './types';

/** Test capacity consumed per included offer, before any battery investigation. */
const TEST_PER_OFFER = 8;

/** Test capacity a carried-over offer needs — far less, since it already shipped once. */
const TEST_PER_CARRIED_OVER_OFFER = 3;

/** Extra validation a premium tier demands. */
const TEST_PREMIUM_SURCHARGE = 5;

export function computeCapacity(pack: ContentPack, decisions: QuarterDecisions): CapacityUsage {
  let engineeringUsed = 0;
  let testUsed = 0;

  for (const variant of pack.variants) {
    const offer = decisions.offers[variant.id];
    if (offer === undefined || !offer.included) {
      continue;
    }

    engineeringUsed += variant.engineeringCost * tierEngineeringMultiplier(offer.tier);
    testUsed += variant.carriedOver ? TEST_PER_CARRIED_OVER_OFFER : TEST_PER_OFFER;
    if (offer.tier === 'premium') {
      testUsed += TEST_PREMIUM_SURCHARGE;
    }
  }

  // Investigating the late battery signal competes directly with validating the lineup.
  testUsed += decisions.batteryInvestigation;

  return {
    engineeringUsed: Math.round(engineeringUsed),
    testUsed: Math.round(testUsed),
    engineeringAvailable: pack.capacity.engineering,
    testAvailable: pack.capacity.test,
    overCommitted:
      Math.round(engineeringUsed) > pack.capacity.engineering ||
      Math.round(testUsed) > pack.capacity.test,
  };
}

/**
 * Test coverage as a fraction of what the lineup needed.
 *
 * Below 1 the player shipped under-validated, which raises defect probability. This is the lever
 * that makes "cut test to fit one more offer" a real and dangerous option.
 */
export function testCoverage(usage: CapacityUsage): number {
  if (usage.testUsed <= 0) {
    return 1;
  }
  return Math.min(1, usage.testAvailable / usage.testUsed);
}

/** Units available to sell after the service reserve is held back. */
export function launchInventory(pack: ContentPack, decisions: QuarterDecisions): number {
  const clamped = Math.max(0, Math.min(1, decisions.reserveSplit));
  return Math.round(pack.capacity.stock * (1 - clamped));
}

/** Units held back to service failures and exchanges. */
export function serviceReserve(pack: ContentPack, decisions: QuarterDecisions): number {
  const clamped = Math.max(0, Math.min(1, decisions.reserveSplit));
  return Math.round(pack.capacity.stock * clamped);
}
