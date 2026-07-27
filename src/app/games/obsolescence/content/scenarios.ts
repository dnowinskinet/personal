/**
 * Pre-registered scenarios — Gate A's single-tester protocol.
 *
 * D-003 replaced tester denominators with **scenario** denominators. The honesty of that depends
 * entirely on pre-registration: each scenario's expected dominant cause is written down here,
 * before the run, and the tester's job is to name it without opening the inspector first.
 *
 * Pass condition: correct dominant cause on 4 of 5.
 *
 * `tests/gate-a/scenarios.test.ts` asserts that each scenario actually produces the signature
 * described below. A pre-registered expectation that does not reproduce is worthless.
 */

import { DEFAULT_DECISIONS } from './doctrines';
import type { OfferDecisions, QuarterDecisions } from '../sim/index';

export interface Scenario {
  readonly id: string;
  readonly label: string;
  /** Shown to the tester. States the situation without giving away the cause. */
  readonly setup: string;
  /** NOT shown until the tester has answered. */
  readonly expectedCause: string;
  readonly seed: number;
  readonly decisions: QuarterDecisions;
}

function withOffers(
  base: QuarterDecisions,
  changes: Readonly<Record<string, Partial<OfferDecisions>>>
): QuarterDecisions {
  const offers: Record<string, OfferDecisions> = { ...base.offers };
  for (const [id, change] of Object.entries(changes)) {
    const existing = offers[id];
    if (existing !== undefined) {
      offers[id] = { ...existing, ...change };
    }
  }
  return { ...base, offers };
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 's1-invisible-veto',
    label: 'S1 — A sensible quarter that lost a fifth of the market',
    setup:
      'A tidy lineup at fair prices, well within capacity, properly tested. Sales are respectable. ' +
      'One whole segment bought nothing at all.',
    expectedCause:
      'The sealed battery drops repairability below Long-Horizon Owners’ hard requirement. They ' +
      'were VETOED, not out-competed — no price or feature change would have won them, only a ' +
      'different battery architecture.',
    seed: 4242,
    decisions: {
      ...DEFAULT_DECISIONS,
      platform: { battery: 'sealed', connector: 'universal', supplier: 'incumbent' },
      batteryInvestigation: 8,
    },
  },
  {
    id: 's2-confusing-lineup',
    label: 'S2 — Two offers, one job',
    setup:
      'Both devices sell. Reach is fine and the money is fine. Clarity is poor and customers took ' +
      'longer than they should have to choose.',
    expectedCause:
      'The carried-over M1 Lite is priced too close to the M2 Standard for the gap between them to ' +
      'read. Customers could not tell what each offer was FOR. The fix is separation — drop the ' +
      'low end’s price or cut it — not more features.',
    seed: 77,
    decisions: withOffers(
      { ...DEFAULT_DECISIONS, platform: { battery: 'modular', connector: 'universal', supplier: 'incumbent' } },
      {
        'lark-m1-lite': { included: true, price: 629, tier: 'standard', supportYears: 4 },
        'lark-m2-standard': { included: true, price: 679, tier: 'standard', supportYears: 4 },
      }
    ),
  },
  {
    id: 's3-stockout',
    label: 'S3 — Everybody wanted it',
    setup:
      'A strong, coherent lineup. Customers wanted it. Reach came in well below what the demand ' +
      'suggested it should have been.',
    expectedCause:
      'Over half the stock pool was held back as service reserve, so launch inventory ran out with ' +
      'demand still on the table. The reserve was not wrong in principle — it was too large for a ' +
      'quarter whose real risk was low.',
    seed: 1234,
    decisions: {
      ...DEFAULT_DECISIONS,
      platform: { battery: 'modular', connector: 'universal', supplier: 'incumbent' },
      reserveSplit: 0.62,
    },
  },
  {
    id: 's4-over-claim',
    label: 'S4 — The best launch we ever had',
    setup: 'Reach is the highest of any scenario here. Trust is the lowest.',
    expectedCause:
      'Every offer shipped an aggressive public claim. That bought attention and volume, and spent ' +
      'belief to do it. Reach was purchased with trust — the claims outran what the product delivers.',
    seed: 909,
    decisions: withOffers(
      {
        ...DEFAULT_DECISIONS,
        platform: { battery: 'modular', connector: 'universal', supplier: 'incumbent' },
        // Deliberate headroom. If the quarter is inventory-limited, extra demand cannot show up as
        // reach and the scenario's whole point becomes invisible.
        reserveSplit: 0.06,
      },
      {
        'lark-m1-lite': { claim: 'aggressive' },
        'lark-m2-standard': { claim: 'aggressive' },
      }
    ),
  },
  {
    id: 's5-under-validated',
    label: 'S5 — We fit everything in',
    setup:
      'The full lineup shipped: low end, Standard, Pro and the accessory. Ownership and trust both ' +
      'came in badly.',
    expectedCause:
      'Including four offers pushed test capacity past its ceiling, so coverage fell and the ' +
      'battery signal was never investigated. The defect that followed was bought by cutting ' +
      'validation to fit one more offer in.',
    seed: 31337,
    decisions: withOffers(
      {
        ...DEFAULT_DECISIONS,
        platform: { battery: 'sealed', connector: 'universal', supplier: 'aggressive' },
        batteryInvestigation: 0,
      },
      {
        'lark-m1-lite': { included: true },
        'lark-m2-standard': { included: true },
        'lark-m2-pro': { included: true, tier: 'premium' },
        dockpass: { included: true },
      }
    ),
  },
];
