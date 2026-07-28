/**
 * Public API of the simulation kernel.
 *
 * Everything outside `sim/` imports from here (`@oi/sim`) and never reaches into individual
 * modules. That keeps the internal layout free to change without a repo-wide refactor.
 *
 * ## Rules for this directory
 *
 * `sim/` is pure TypeScript with **no** Angular, no renderer, no DOM, and no Node built-ins. It has
 * to run identically in a browser, in a worker, and in a bare Node process. The invariants it
 * carries are I-001 through I-008; `npm run oi:arch` enforces them and `tsconfig.sim.json` compiles
 * without the DOM library so a stray `document` reference is a compile error, not a review catch.
 */

export { TICK_HZ, TICK_MS, simulatedMsAt, ticksForMs } from './clock';
export { pickAt, randomAt, randomIntAt } from './rng';
export {
  SCHEMA_VERSION,
  createInitialState,
  findEntity,
  formatEntityId,
  orderedEntities,
  type Entity,
  type SimState,
} from './state';
export {
  sortCommandLog,
  type Command,
  type CreateEntityCommand,
  type DrawCommand,
  type RemoveEntityCommand,
  type ScheduledCommand,
} from './commands';
export { advanceTick, applyCommand, reset } from './reduce';
export { deserialize, run, serialize, verifyReplay, type RunOptions } from './kernel';
export * from './quarter';
export * from './building';
export * from './facility';
export * from './bridge/product-adapter';
