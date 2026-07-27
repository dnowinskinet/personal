/**
 * Quarter configurations.
 *
 * Content supplies instances; `sim/` owns the schema. Tuned so the full range of outcomes is
 * reachable — a flagship build is possible but demands real research investment, and starving any
 * one sink is visibly punished.
 */

import type { QuarterConfig } from '../sim/index';

/**
 * The opening quarter.
 *
 * 1800 ticks at 10 Hz is three minutes of real time — long enough for the deadline to build, short
 * enough to replay immediately, and inside R1's 25–35 minute quarter once the surrounding phases
 * exist.
 */
export const Q1: QuarterConfig = {
  id: 'q1',
  lengthTicks: 1800,
  staff: 12,
  workforceSkill: 0.55,
  // Tuned so nothing saturates. Research level rises DURING the quarter, so parts made early are
  // stuck at whatever tier you had researched by then — which is what makes front-loading research
  // a real decision rather than a preference.
  researchPerLevel: 150,
  marketTarget: 600,
  productionRate: 0.0020,
  goalScore: 56,
  goalLabel: 'Ship something the board can call a product.',
};

/** A tighter quarter for testing the squeeze: less staff, higher bar. */
export const Q1_TIGHT: QuarterConfig = {
  ...Q1,
  id: 'q1-tight',
  staff: 9,
  goalScore: 62,
  goalLabel: 'Ship on a reduced headcount. The board is watching.',
};

export const QUARTERS: readonly QuarterConfig[] = [Q1, Q1_TIGHT];
