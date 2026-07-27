/**
 * The quarter ladder.
 *
 * Playtest verdict on the full game cold: it "hits the learning curve like a brick wall", like
 * joining a game halfway through with no prologue. So the systems arrive one at a time. Each stage
 * turns on exactly one new thing, and the first is a single part that cannot fail.
 *
 * Content supplies instances; `sim/` owns the schema.
 */

import type { QuarterConfig } from '../sim/index';

/** Shared tuning. Stages override only what they change. */
const BASE = {
  workforceSkill: 0.55,
  researchPerLevel: 150,
  marketTarget: 600,
  productionRate: 0.002,
} as const;

/**
 * Q1 — one thing, and it cannot fail.
 *
 * No allocation, no research, no market, one part kind, one grade. Everyone builds chassis. You
 * watch the shelf fill, the clock run out, and you ship. The only thing being taught is that a
 * quarter ends and you build from what you made.
 */
export const Q1_ONE_THING: QuarterConfig = {
  ...BASE,
  id: 'q1-one-thing',
  title: 'Q1 — One thing',
  teaches: 'A quarter ends. You build from what you made.',
  enabled: { allocation: false, research: false, market: false, focus: false },
  partKinds: ['chassis'],
  lengthTicks: 600,
  staff: 6,
  goalScore: 12,
  goalLabel: 'Make one of anything. Genuinely, that is the whole brief.',
};

/**
 * Q2 — two shelves.
 *
 * A second part kind and the focus control. A build now needs one of each, so pointing everyone at
 * chassis all quarter leaves you unable to ship. First way to actually get it wrong.
 */
export const Q2_TWO_SHELVES: QuarterConfig = {
  ...BASE,
  id: 'q2-two-shelves',
  title: 'Q2 — Two shelves',
  teaches: 'A build needs one of each. Watch what you are short of.',
  enabled: { allocation: false, research: false, market: false, focus: true },
  partKinds: ['chassis', 'board'],
  lengthTicks: 900,
  staff: 8,
  goalScore: 16,
  goalLabel: 'Ship something with both parts in it.',
};

/**
 * Q3 — better parts.
 *
 * Research appears, and with it staff allocation, tiers, and grades above salvage. The first real
 * tension: time spent researching is time not spent producing.
 */
export const Q3_BETTER_PARTS: QuarterConfig = {
  ...BASE,
  id: 'q3-better-parts',
  title: 'Q3 — Better parts',
  teaches: 'Research raises what you can build. It costs production time.',
  enabled: { allocation: true, research: true, market: false, focus: true },
  partKinds: ['chassis', 'board'],
  lengthTicks: 1200,
  staff: 10,
  goalScore: 68,
  goalLabel: 'Ship something better than scrap.',
};

/**
 * Q4 — someone has to hear about it.
 *
 * Market prep appears. A good product nobody knows about now scores badly, which is the third sink
 * and the up-versus-down decision in its first honest form.
 */
export const Q4_HEARD_OF_IT: QuarterConfig = {
  ...BASE,
  id: 'q4-heard-of-it',
  title: 'Q4 — Someone has to hear about it',
  teaches: 'A great product nobody knows about is a bad quarter.',
  enabled: { allocation: true, research: true, market: true, focus: true },
  partKinds: ['chassis', 'board'],
  lengthTicks: 1500,
  staff: 11,
  goalScore: 33,
  goalLabel: 'Ship it and make sure it lands.',
};

/**
 * Q5 — the real thing.
 *
 * Three part kinds, everything on. This is the quarter the balance sweep is tuned against.
 */
export const Q5_THE_REAL_THING: QuarterConfig = {
  ...BASE,
  id: 'q5-the-real-thing',
  title: 'Q5 — The real thing',
  teaches: 'Everything at once, and not enough of anything.',
  enabled: { allocation: true, research: true, market: true, focus: true },
  partKinds: ['chassis', 'board', 'cell'],
  lengthTicks: 1800,
  staff: 12,
  goalScore: 56,
  goalLabel: 'Ship something the board can call a product.',
};

export const LADDER: readonly QuarterConfig[] = [
  Q1_ONE_THING,
  Q2_TWO_SHELVES,
  Q3_BETTER_PARTS,
  Q4_HEARD_OF_IT,
  Q5_THE_REAL_THING,
];

/** The quarter the balance sweep and Gate A conditions are measured against. */
export const Q1 = Q5_THE_REAL_THING;
