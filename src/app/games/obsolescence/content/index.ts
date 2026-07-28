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
export { FACILITY_CONFIG, HEALTHY_BANDS, JOB_WEIGHTS, DEFERRED_PRIORS, NO_THRASH_THRESHOLD } from './facility/balance';
export { FACILITY_CONTENT, OBJECTS, PROFESSIONS, PROFESSION_NAMES, ROOM_TYPES } from './facility/catalogue';
export { SCENARIOS, scenarioById, type Scenario } from './facility/scenarios';
