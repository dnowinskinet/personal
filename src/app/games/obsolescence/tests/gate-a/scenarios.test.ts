/**
 * Verifies the pre-registered scenarios actually produce the signature they claim.
 *
 * A pre-registered expectation that does not reproduce is worse than none — it would have the
 * tester hunting for a cause that is not there, and Gate A condition 3 would be measuring nothing.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LARK_PACK } from '../../content/lark';
import { SCENARIOS } from '../../content/scenarios';
import { computeCapacity, resolveQuarter, testCoverage } from '../../sim/index';

function scenario(id: string) {
  const found = SCENARIOS.find((entry) => entry.id === id);
  assert.ok(found, `scenario ${id} is missing`);
  return found;
}

function outcomeOf(id: string) {
  const entry = scenario(id);
  return resolveQuarter(LARK_PACK, entry.decisions, entry.seed);
}

describe('pre-registered scenarios reproduce their expected cause', () => {
  it('S1 — a segment is vetoed outright, not out-competed', () => {
    const outcome = outcomeOf('s1-invisible-veto');
    const longHorizon = outcome.segments.find((entry) => entry.segmentId === 'long-horizon-owners');

    assert.ok(longHorizon);
    assert.equal(longHorizon.chosenVariantId, null, 'Long-Horizon Owners must buy nothing');
    assert.ok(longHorizon.vetoed.length > 0, 'and the veto must be stated');
    assert.ok(
      longHorizon.vetoed.some((reason) => reason.includes('repairability')),
      `the veto must name repairability, got: ${longHorizon.vetoed.join(' | ')}`
    );
    // Everyone else should still be buying, or the cause is ambiguous.
    const buyers = outcome.segments.filter((entry) => entry.chosenVariantId !== null);
    assert.ok(buyers.length >= 2, 'other segments must still buy, or the scenario has two causes');
  });

  it('S2 — the lineup reads as confusing', () => {
    const outcome = outcomeOf('s2-confusing-lineup');
    assert.ok(
      outcome.segments.some((entry) => entry.confused),
      'at least one segment must be unable to tell two offers apart'
    );
    assert.ok(outcome.clarity < 80, `clarity should be visibly damaged, got ${outcome.clarity}`);
    assert.ok(outcome.unitsSold > 0, 'but the quarter must still sell — the fault is clarity, not demand');
  });

  it('S3 — demand exists but inventory ran out', () => {
    const outcome = outcomeOf('s3-stockout');
    assert.ok(outcome.stockouts > 0, 'there must be unmet demand');
    assert.ok(
      outcome.stockouts > outcome.unitsSold * 0.2,
      `unmet demand must be substantial, got ${outcome.stockouts} against ${outcome.unitsSold} sold`
    );
    assert.equal(outcome.overhang, 0, 'and nothing may be left unsold, or the cause is ambiguous');
  });

  it('S4 — reach was bought with trust', () => {
    const overClaim = outcomeOf('s4-over-claim');
    const entry = scenario('s4-over-claim');
    const restrained = resolveQuarter(
      LARK_PACK,
      {
        ...entry.decisions,
        offers: Object.fromEntries(
          Object.entries(entry.decisions.offers).map(([id, offer]) => [
            id,
            { ...offer, claim: 'conservative' as const },
          ])
        ),
      },
      entry.seed
    );

    assert.ok(
      overClaim.reach > restrained.reach,
      `aggressive claims must raise reach (${overClaim.reach} vs ${restrained.reach})`
    );
    assert.ok(
      overClaim.trust < restrained.trust,
      `and must cost trust (${overClaim.trust} vs ${restrained.trust})`
    );
  });

  it('S5 — validation was cut to fit another offer in', () => {
    const entry = scenario('s5-under-validated');
    const usage = computeCapacity(LARK_PACK, entry.decisions);
    const outcome = outcomeOf('s5-under-validated');

    assert.ok(usage.overCommitted, 'the lineup must be over-committed');
    assert.ok(
      testCoverage(usage) < 1,
      `test coverage must be below full, got ${testCoverage(usage)}`
    );
    assert.equal(entry.decisions.batteryInvestigation, 0, 'and the signal must be uninvestigated');
    assert.ok(outcome.defectOccurred, 'the defect must actually fire at this seed');
    assert.ok(outcome.ownership < 55, `ownership should be poor, got ${outcome.ownership}`);
  });

  it('every scenario states a cause and is reachable', () => {
    assert.equal(SCENARIOS.length, 5);
    for (const entry of SCENARIOS) {
      assert.ok(entry.setup.length > 40, `${entry.id} needs a setup the tester can read`);
      assert.ok(entry.expectedCause.length > 40, `${entry.id} needs a stated expected cause`);
      const outcome = resolveQuarter(LARK_PACK, entry.decisions, entry.seed);
      assert.ok(outcome.segments.length === 4, `${entry.id} must resolve all four segments`);
    }
  });

  it('the five scenarios are distinguishable from one another', () => {
    // If two scenarios produce the same signature, the tester cannot be scored on naming the cause.
    // The markers are cause-SPECIFIC on purpose. A generic "something was vetoed" is useless here,
    // because Prestige Seekers are vetoed in any lineup without a premium-tier device — that is
    // baseline behaviour, not a scenario's distinguishing feature.
    const signatures = SCENARIOS.map((entry) => {
      const outcome = resolveQuarter(LARK_PACK, entry.decisions, entry.seed);
      const longHorizon = outcome.segments.find((segment) => segment.segmentId === 'long-horizon-owners');
      return [
        longHorizon?.chosenVariantId === null ? 'longHorizonVetoed' : '-',
        outcome.segments.filter((segment) => segment.confused).length > 0 ? 'confused' : '-',
        outcome.stockouts > outcome.unitsSold * 0.2 ? 'starved' : '-',
        outcome.defectOccurred ? 'defect' : '-',
        outcome.trust < 65 ? 'distrusted' : '-',
      ].join('|');
    });
    assert.equal(new Set(signatures).size, signatures.length, `signatures collide: ${signatures.join('  ')}`);
  });
});
