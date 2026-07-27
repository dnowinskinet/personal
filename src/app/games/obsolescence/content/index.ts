/**
 * Content registries.
 *
 * Data only. Behaviour lives in `sim/`; this layer supplies instances conforming to the
 * simulation's schema. Adding a quarter, part or goal should be a change here and nowhere else —
 * that is the extension test in ARCHITECTURE.md.
 */

export {
  LADDER,
  Q1,
  Q1_ONE_THING,
  Q2_TWO_SHELVES,
  Q3_BETTER_PARTS,
  Q4_HEARD_OF_IT,
  Q5_THE_REAL_THING,
} from './quarters';
export { CAMPAIGN_START, FLOORS } from './floors';
