/**
 * Gate A pass conditions 1 and 2 — the machine-measurable halves.
 *
 * See docs/obsolescence/gates/A-lineup-prototype.brief.md. These are the checks that replace a
 * tester panel: no dominant posture, and no fake decisions.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LARK_PACK } from '../../content/lark';
import { DEFAULT_DECISIONS, DOCTRINES } from '../../content/doctrines';
import { decisionSensitivity, runSweep } from '../../devtools/sweep';
import { resolveQuarter, type QuarterDecisions } from '../../sim/index';

const SEEDS = 200;

describe('Gate A condition 1 — no dominant posture', () => {
  const result = runSweep(LARK_PACK, SEEDS);

  it('runs every doctrine across the full seed set', () => {
    assert.equal(result.seeds, SEEDS);
    assert.equal(result.doctrines.length, 3);
  });

  it('has no posture sweeping reach, trust and ownership in more than 60% of seeds', () => {
    const detail = result.doctrines
      .map((entry) => `${entry.name} sweeps ${((entry.sweeps / SEEDS) * 100).toFixed(0)}%`)
      .join(', ');
    assert.equal(
      result.dominant,
      null,
      `a posture dominates — tradeoffs are decorative. ${detail}`
    );
    assert.ok(result.worstSweepShare <= 0.6, `worst sweep share ${result.worstSweepShare}`);
  });

  it('gives every posture at least one dimension in at least 20% of seeds', () => {
    const detail = result.doctrines
      .map((entry) => `${entry.name} wins something in ${((entry.anyWin / SEEDS) * 100).toFixed(0)}%`)
      .join(', ');
    assert.ok(
      result.weakestAnyWinShare >= 0.2,
      `a posture is never worth playing. ${detail}`
    );
  });

  it('produces genuinely different profiles rather than three copies', () => {
    const durable = result.doctrines.find((entry) => entry.name === 'durable');
    const premium = result.doctrines.find((entry) => entry.name === 'premium');
    const scale = result.doctrines.find((entry) => entry.name === 'scale');
    assert.ok(durable && premium && scale);

    // The shape each doctrine is supposed to have, per CANON.md §4.
    assert.ok(
      durable.ownership > premium.ownership,
      `durable should out-own premium (${durable.ownership} vs ${premium.ownership})`
    );
    assert.ok(
      scale.reach > durable.reach,
      `scale-first should out-reach durable (${scale.reach} vs ${durable.reach})`
    );
    assert.ok(
      scale.defectRate > durable.defectRate,
      `scale-first should carry more defect risk (${scale.defectRate}% vs ${durable.defectRate}%)`
    );
  });
});

describe('Gate A condition 2 — every headline decision moves outcomes', () => {
  const flips: readonly { name: string; decisions: QuarterDecisions }[] = [
    {
      name: 'battery architecture',
      decisions: {
        ...DEFAULT_DECISIONS,
        platform: { ...DEFAULT_DECISIONS.platform, battery: 'sealed' },
      },
    },
    {
      name: 'connector stance',
      decisions: {
        ...DEFAULT_DECISIONS,
        platform: { ...DEFAULT_DECISIONS.platform, connector: 'proprietary' },
      },
    },
    {
      name: 'supplier',
      decisions: {
        ...DEFAULT_DECISIONS,
        platform: { ...DEFAULT_DECISIONS.platform, supplier: 'aggressive' },
      },
    },
    {
      name: 'support promise',
      decisions: {
        ...DEFAULT_DECISIONS,
        offers: Object.fromEntries(
          Object.entries(DEFAULT_DECISIONS.offers).map(([id, offer]) => [
            id,
            { ...offer, supportYears: 7 },
          ])
        ),
      },
    },
    {
      name: 'reserve split',
      decisions: { ...DEFAULT_DECISIONS, reserveSplit: 0.55 },
    },
  ];

  for (const flip of flips) {
    it(`${flip.name} moves at least two dimensions in 80% of seeds`, () => {
      const share = decisionSensitivity(LARK_PACK, DEFAULT_DECISIONS, flip.decisions, SEEDS);
      assert.ok(
        share >= 0.8,
        `${flip.name} only moved two dimensions in ${(share * 100).toFixed(0)}% of seeds — it is a fake choice`
      );
    });
  }
});

describe('the model behaves sanely', () => {
  it('is deterministic for a given seed and decision set', () => {
    const first = resolveQuarter(LARK_PACK, DEFAULT_DECISIONS, 4242);
    const second = resolveQuarter(LARK_PACK, DEFAULT_DECISIONS, 4242);
    assert.deepEqual(first, second);
  });

  it('produces different outcomes for different seeds', () => {
    const outcomes = new Set(
      Array.from({ length: 40 }, (_, index) =>
        JSON.stringify(resolveQuarter(LARK_PACK, DEFAULT_DECISIONS, index * 31 + 1))
      )
    );
    assert.ok(outcomes.size > 1, 'seed has no effect at all');
  });

  it('keeps every dimension inside 0..100', () => {
    for (const doctrine of DOCTRINES) {
      for (let index = 0; index < 60; index += 1) {
        const outcome = resolveQuarter(LARK_PACK, doctrine.decisions, index * 977 + 3);
        for (const dimension of ['reach', 'portfolio', 'clarity', 'trust', 'ownership'] as const) {
          const value = outcome[dimension];
          assert.ok(
            value >= 0 && value <= 100,
            `${doctrine.name}.${dimension} = ${value} out of range at seed index ${index}`
          );
        }
      }
    }
  });

  it('vetoes a sealed battery for Long-Horizon Owners', () => {
    // The hard must-have that makes battery architecture a real decision. A sealed pack should be
    // refused outright, not merely scored down.
    const sealed: QuarterDecisions = {
      ...DEFAULT_DECISIONS,
      platform: { ...DEFAULT_DECISIONS.platform, battery: 'sealed' },
    };
    const outcome = resolveQuarter(LARK_PACK, sealed, 77);
    const longHorizon = outcome.segments.find((entry) => entry.segmentId === 'long-horizon-owners');
    assert.ok(longHorizon);
    assert.equal(longHorizon.chosenVariantId, null, 'Long-Horizon Owners should refuse a sealed lineup');
    assert.ok(longHorizon.vetoed.length > 0, 'and the refusal must carry a stated reason');
  });

  it('always explains why a segment did not buy', () => {
    for (const doctrine of DOCTRINES) {
      const outcome = resolveQuarter(LARK_PACK, doctrine.decisions, 555);
      for (const segment of outcome.segments) {
        assert.ok(segment.reason.length > 0, `${doctrine.name}/${segment.segmentId} gave no reason`);
      }
    }
  });
});
